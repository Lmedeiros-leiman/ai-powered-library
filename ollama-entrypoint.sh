#!/bin/sh
ollama serve &
SERVER_PID=$!

until ollama list > /dev/null 2>&1; do
  sleep 1
done

echo "Ollama ready, pulling model: ${OLLAMA_MODEL:-qwen3:4b}"
ollama pull ${OLLAMA_MODEL:-qwen3:4b}

wait $SERVER_PID