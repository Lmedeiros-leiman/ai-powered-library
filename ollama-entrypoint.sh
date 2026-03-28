#!/bin/sh

set -e

echo "Starting Ollama server..."
ollama serve &
SERVER_PID=$!

echo "Waiting for Ollama to be ready..."

until ollama list > /dev/null 2>&1; do
  sleep 1
done

echo "Ollama is ready."

MODEL=${OLLAMA_MODEL:-qwen3.5:0.8b}

echo "Pulling model: $MODEL"
ollama pull "$MODEL"

echo "Model ready."

wait $SERVER_PID