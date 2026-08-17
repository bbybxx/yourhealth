#!/usr/bin/env bash
# Ежедневное обновление сайта: парсинг -> экспорт -> сборка -> перезапуск сервера.
# Пути вычисляются относительно расположения скрипта.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRAPER_DIR="$ROOT/scraper"
SITE_DIR="$ROOT/site"
LOG_DIR="$ROOT/logs"
mkdir -p "$LOG_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Старт обновления ==="

# 1. Парсинг (инкрементальный)
echo "[1/3] Парсинг www.vitaminy.kg..."
cd "$SCRAPER_DIR"
./venv/bin/python scraper.py >>"$LOG_DIR/scraper.log" 2>&1

# 2. Экспорт в JSON (с умножением цен на 2.1–2.85) и копирование картинок
echo "[2/3] Экспорт данных..."
cd "$SITE_DIR"
node scripts/export-data.mjs >>"$LOG_DIR/export.log" 2>&1

# 3. Сборка и перезапуск сервера
echo "[3/3] Сборка сайта..."
npm run build >>"$LOG_DIR/build.log" 2>&1

# Перезапуск продакшн-сервера (если запущен)
if pgrep -f 'next-server' >/dev/null 2>&1; then
  pkill -f 'next-server' || true
  sleep 2
fi
if [ "${START_SERVER:-1}" = "1" ]; then
  (cd "$SITE_DIR" && PORT="${SITE_PORT:-3100}" nohup npm start >>"$LOG_DIR/server.log" 2>&1 &)
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Готово ==="
