#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
./tools/picoclaw/picoclaw agent -m "Use tools/picoclaw/config/assistant-relacionamento.md como regras. Atue apenas como planejador do motor de relacionamento. Não altere código sem aprovação."
