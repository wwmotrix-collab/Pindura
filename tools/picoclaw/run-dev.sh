#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
./tools/picoclaw/picoclaw agent -m "Use tools/picoclaw/config/base-replicavel.md e tools/picoclaw/config/assistant-dev.md como regras. Atue como assistente de desenvolvimento do Pindura. Antes de alterar, mostre plano. Ao final execute git status e git diff."
