#!/bin/bash

# Script para ejecutar Prisma Studio en Docker
# Uso: ./scripts/prisma-studio.sh

echo "🔍 Iniciando Prisma Studio en Docker..."

# Verificar que los contenedores estén corriendo
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Los contenedores no están corriendo. Iniciando..."
    docker compose up -d
    sleep 5
fi

# Verificar que la base de datos esté lista
echo "📊 Verificando base de datos..."
docker compose exec app npx prisma db push > /dev/null 2>&1

# Ejecutar Prisma Studio
echo "🚀 Iniciando Prisma Studio..."
echo "📱 Prisma Studio estará disponible en: http://localhost:5555"
echo "⏹️  Presiona Ctrl+C para detener"

docker compose exec app npx prisma studio --hostname 0.0.0.0 --port 5555 