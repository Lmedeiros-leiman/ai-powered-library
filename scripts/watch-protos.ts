import chokidar from "chokidar";
import { spawn } from "child_process";
import path from "path";
import { parseArgs } from "util";
import fs from "fs";

// ─── CLI Args ─────────────────────────────────────────────────────────────────
//
// Padrão (sem flags): roda tudo, one-shot
//
// Flags opt-in de target:
//   --server   → só rebuilda o C#
//   --web      → só gera os tipos TS
//
// Flag de modo:
//   --watch    → fica observando mudanças nos .proto
//
// Exemplos:
//   bun scripts/watch-proto.ts                      # one-shot, tudo
//   bun scripts/watch-proto.ts --watch              # watch, tudo
//   bun scripts/watch-proto.ts --server             # one-shot, só C#
//   bun scripts/watch-proto.ts --web --watch        # watch, só web
//   bun scripts/watch-proto.ts --server --web       # equivale a sem flags

const { values: flags } = parseArgs({
  args: process.argv.slice(2),
  options: {
    server: { type: "boolean", default: false },
    web: { type: "boolean", default: false },
    watch: { type: "boolean", default: false },
  },
});

const runAll = !flags.server && !flags.web;
const shouldRunServer = runAll || flags.server;
const shouldRunWeb = runAll || flags.web;
const watchMode = flags.watch;

// ─── Config ───────────────────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dir, "..");

const PROTO_DIR = path.join(ROOT, "Protos");
const WEB_OUT_DIR = path.join(ROOT, "web-client", "src", "proto");
const SERVER_DIR = path.join(ROOT, "server");

const DEBOUNCE_MS = 300;

const isWindows = process.platform === "win32";
const pluginExt = isWindows ? ".exe" : "";
const PROTOC = path.join(ROOT, "node_modules", ".bin", `grpc_tools_node_protoc${pluginExt}`);
const PROTOC_PLUGIN = path.join(ROOT, "node_modules", ".bin", `protoc-gen-ts_proto${pluginExt}`);

// ─── Runner ───────────────────────────────────────────────────────────────────

function run(
  label: string,
  cmd: string,
  args: string[],
  cwd?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n[${label}] $ ${cmd} ${args.join(" ")}`);

    const proc = spawn(cmd, args, {
      cwd: cwd ?? ROOT,
      stdio: "inherit",
      shell: true,
    });

    proc.on("exit", (code) => {
      if (code === 0) {
        console.log(`[${label}] ✓ done`);
        resolve();
      } else {
        reject(new Error(`[${label}] ✗ exited with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

async function rebuild() {
  const targets = [shouldRunServer && "server", shouldRunWeb && "web"]
    .filter(Boolean)
    .join(" + ");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔁 rebuilding: ${targets}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (shouldRunServer) {
    await run("server", "dotnet", ["build"], SERVER_DIR).catch(() => {
      throw new Error("Falha no build do C# — veja output acima");
    });
  }

  if (shouldRunWeb) {
    const protoFiles = fs
      .readdirSync(PROTO_DIR)
      .filter((f) => f.endsWith(".proto"))
      .map((f) => path.join(PROTO_DIR, f));

    if (protoFiles.length === 0) {
      console.warn("[web/proto] Nenhum .proto encontrado em", PROTO_DIR);
    } else {
      fs.mkdirSync(WEB_OUT_DIR, { recursive: true });

      await run("web/proto", PROTOC, [
        `--plugin=protoc-gen-ts_proto=${PROTOC_PLUGIN}`,
        `--ts_proto_out=${WEB_OUT_DIR}`,
        "--ts_proto_opt=esModuleInterop=true",
        "--ts_proto_opt=outputServices=generic-definitions",
        "--ts_proto_opt=useOptionals=messages",
        "--ts_proto_opt=stringEnums=true",
        `--proto_path=${PROTO_DIR}`,
        ...protoFiles,
      ]);
    }
  }
}

// ─── One-shot mode ────────────────────────────────────────────────────────────

if (!watchMode) {
  rebuild().catch((err) => {
    console.error("\n✗ Build failed:", err.message);
    process.exit(1);
  });

// ─── Watch mode ───────────────────────────────────────────────────────────────

} else {
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let isRunning = false;
  let pendingRebuild = false;

  async function triggerRebuild() {
    if (isRunning) {
      pendingRebuild = true;
      console.log("\n[watch] Change detected mid-build — will rebuild again after.");
      return;
    }

    isRunning = true;
    pendingRebuild = false;

    try {
      await rebuild();
    } catch (err) {
      console.error("\n✗ Build failed:", (err as Error).message);
    } finally {
      isRunning = false;
      if (pendingRebuild) {
        console.log("\n[watch] Running pending rebuild...");
        triggerRebuild();
      }
    }
  }

  function scheduleRebuild(changedPath: string) {
    console.log(`[watch] Detected change: ${path.relative(ROOT, changedPath)}`);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => triggerRebuild(), DEBOUNCE_MS);
  }

  console.log(`[watch] Watching ${path.relative(ROOT, PROTO_DIR)}/*.proto`);
  console.log("[watch] Press Ctrl+C to stop\n");

  triggerRebuild();

  chokidar
    .watch(`${PROTO_DIR}/**/*.proto`, { ignoreInitial: true })
    .on("change", scheduleRebuild)
    .on("add", scheduleRebuild)
    .on("unlink", scheduleRebuild);
}