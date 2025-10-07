#!/bin/bash

# Скрипт для деплоя на GitHub Pages
# Использование: ./deploy.sh "Ваше сообщение коммита"

set -e

# Проверяем наличие сообщения коммита
if [ $# -eq 0 ]; then
    echo "❌ Пожалуйста, укажите сообщение коммита"
    echo "Использование: ./deploy.sh \"Ваше сообщение коммита\""
    exit 1
fi

COMMIT_MESSAGE=$1

echo "🚀 Начинаем деплой..."

# Собираем проект
echo "📦 Сборка проекта..."
npm run build

# Проверяем, установлен ли gh-pages
if ! npm list gh-pages | grep gh-pages > /dev/null; then
    echo "📥 Установка gh-pages..."
    npm install --save-dev gh-pages
fi

# Деплой
echo "🌐 Публикация на GitHub Pages..."
npm run deploy

# Коммитим изменения
echo "💾 Коммит исходного кода..."
git add .
git commit -m "$COMMIT_MESSAGE" || true

# Пушим изменения
echo "📤 Отправка изменений в репозиторий..."
git push origin main

echo "✅ Деплой завершен!"
echo "📢 Ваше приложение доступно по адресу: https://evilkuma.github.io/doodle-jump"