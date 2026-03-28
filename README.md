# ai-powered-library

Um pequeno projeto que simula uma livraria utilizando um sistema de IA para ajudar com o atendimento aos clientes.

O Projeto tem um cliente web e um servidor. facilmente expandivel pra qualquer cliente que tenha suporte a gRPC (ainda mais se tiver um gerador de código.)

Projeto usa docker (ou podman), valida a config no docker-compose, pois por padrão meu pc é fraco então eu forcei o ollama a usar minha CPU. isso implica que a config precisa ser removida pra quem tem placa de video forte.


Só rodar `npm run dev` que a pipeline de buildar o docker-compose deve funcionar.
se falhar, tenta com bun (que foi o que eu usei pra criar.)


web-client -> http://localhost:5173
server gRPC -> http://localhost:8080
Ollama -> http://localhost:11434

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.11. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
