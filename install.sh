#!/usr/bin/env bash
# Tao Video Suite — cài skills cho các agent + trỏ template
#
# Cách dùng:
#   ./install.sh                      # copy 2 skills vào ~/.agents/skills (chuẩn chung) + trỏ template về <repo>/template
#   ./install.sh claude              # thêm bản copy vào ~/.claude/skills (Claude Code)
#   ./install.sh zcode               # thêm bản copy vào ~/.zcode/skills
#   ./install.sh --set-template DIR  # đổi đường dẫn template ghi trong SKILL.md + AGENTS.md
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_SRC="$REPO_DIR/skills"
DEFAULT_TEMPLATE="$REPO_DIR/template"
OLD_TEMPLATE="/Volumes/SSD_1TB/Video Remotion/template"

copy_skills() {
  local dest="$1"
  mkdir -p "$dest"
  for skill in tao-chu-de-video tao-video-remotion; do
    rm -rf "$dest/$skill"
    rsync -a --exclude '._*' --exclude '.DS_Store' "$SKILLS_SRC/$skill" "$dest/"
    echo "✓ $skill → $dest/$skill"
  done
}

set_template() {
  local dir="$1"
  if [ ! -f "$dir/package.json" ]; then
    echo "⚠️  $dir không giống template Remotion (thiếu package.json) — vẫn ghi? [y/N]"
    read -r ans
    [ "$ans" = "y" ] || exit 1
  fi
  for f in "$SKILLS_SRC/tao-video-remotion/SKILL.md" "$REPO_DIR/AGENTS.md"; do
    sed -i.bak "s|$OLD_TEMPLATE|$dir|g" "$f" && rm -f "$f.bak"
  done
  echo "✓ Đường dẫn template trong skill = $dir"
}

case "${1:-}" in
  claude)
    copy_skills "$HOME/.claude/skills"
    ;;
  zcode)
    copy_skills "$HOME/.zcode/skills"
    ;;
  --set-template)
    [ -n "${2:-}" ] || { echo "Thiếu đường dẫn. Ví dụ: ./install.sh --set-template /path/to/template"; exit 1; }
    set_template "$2"
    ;;
  "")
    copy_skills "$HOME/.agents/skills"
    set_template "$DEFAULT_TEMPLATE"
    echo ""
    echo "Hoàn tất. Nhớ:"
    echo "  cd template && npm install && cp .env.example .env"
    echo "  (tạo GitHub repo: git remote add origin <url> && git push -u origin main)"
    ;;
  *)
    echo "Không hiểu: $1. Dùng: ./install.sh [claude|zcode|--set-template DIR]"
    exit 1
    ;;
esac
