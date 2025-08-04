#!/bin/bash

# Script para configurar la autenticación de GitHub de forma segura
# Uso: ./scripts/setup-github.sh

echo "🔐 Configurando autenticación de GitHub..."

# Verificar si el token está configurado
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN no está configurado"
    echo "Por favor, configura tu token de GitHub:"
    echo "export GITHUB_TOKEN=tu_token_aqui"
    exit 1
fi

# Configurar el remote con el token
echo "📡 Configurando remote con token..."
git remote set-url origin https://gustavo180591:${GITHUB_TOKEN}@github.com/gustavo180591/ecommerce-zapatillas.git

# Verificar la configuración
echo "✅ Verificando configuración..."
git remote -v

echo "🎉 Configuración completada!"
echo "Ahora puedes hacer push/pull sin problemas de autenticación." 