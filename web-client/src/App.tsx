import { useState } from 'react'
import { ConnectError, createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { Greeter } from "./proto/greet_pb";

const transport = createGrpcWebTransport({
  baseUrl: "http://localhost:8080",
});

const client = createClient(Greeter, transport);

function App() {
  const [response, setResponse] = useState<string>("")
  const [input, setInput] = useState<string>("Leo");

  async function callApi() {
    try {
      const res = await client.sayHello({ name: input });
      setResponse(res.message);
    } catch (err) {
      if (err instanceof ConnectError) {
        console.error(err.code, err.message);
      }
    }
  }

  return (
    <div style={{
      maxWidth: "480px",
      margin: "4rem auto",
      padding: "0 1rem",
      fontFamily: "sans-serif",
    }}>
      <h1 style={{
        fontSize: "22px",
        fontWeight: 500,
        marginBottom: "0.5rem",
        letterSpacing: "-0.5px",
      }}>
        Livraria
      </h1>
      <p style={{
        fontSize: "13px",
        color: "#888",
        marginBottom: "2rem",
        borderBottom: "0.5px solid #e5e5e5",
        paddingBottom: "1.5rem",
      }}>
        Converse com nossa IA
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && callApi()}
          placeholder="Digite seu nome..."
          style={{
            flex: 1,
            height: "42px",
            padding: "0 12px",
            fontSize: "14px",
            border: "0.5px solid #ddd",
            borderRadius: "8px",
            outline: "none",
          }}
        />
        <button
          onClick={callApi}
          style={{
            height: "42px",
            padding: "0 16px",
            fontSize: "14px",
            border: "0.5px solid #ddd",
            borderRadius: "8px",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </div>

      {response && (
        <div style={{
          padding: "10px 14px",
          background: "#f5f5f5",
          borderRadius: "8px",
          fontSize: "14px",
          lineHeight: 1.6,
        }}>
          {response}
        </div>
      )}
    </div>
  );
}

export default App;