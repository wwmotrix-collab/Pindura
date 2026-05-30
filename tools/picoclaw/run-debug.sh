#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
./tools/picoclaw/picoclaw agent -m "$(cat tools/picoclaw/prompts/debug-pindura.md)"
