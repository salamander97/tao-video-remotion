#!/usr/bin/env bash
# Trình khởi chạy tiện lợi cho macOS/Linux.
# Windows chạy trực tiếp: node scripts/setup.mjs
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$REPO_DIR/scripts/setup.mjs" "$@"
