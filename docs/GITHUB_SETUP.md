# Configuración de GitHub para el Proyecto

## Autenticación con Token Personal

Este proyecto está configurado para usar autenticación con token personal de GitHub.

### Configuración Inicial

1. **Configurar el token como variable de entorno:**
   ```bash
   export GITHUB_TOKEN=tu_token_aqui
   ```

2. **Agregar el token a tu shell profile (recomendado):**
   ```bash
   echo 'export GITHUB_TOKEN="tu_token_aqui"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Ejecutar el script de configuración:**
   ```bash
   npm run setup-github
   ```

### Uso del Script de Configuración

El proyecto incluye un script automatizado para configurar la autenticación:

```bash
# Usando npm
npm run setup-github

# O directamente
./scripts/setup-github.sh
```

### Verificación

Para verificar que la configuración funciona:

```bash
# Verificar el remote configurado
git remote -v

# Hacer un push de prueba
git push origin main
```

### Seguridad

- ✅ El token está configurado como variable de entorno
- ✅ El archivo `.env` está en `.gitignore`
- ✅ El token no se expone en el código
- ✅ Se usa autenticación HTTPS con token

### Troubleshooting

Si tienes problemas de autenticación:

1. Verifica que el token sea válido
2. Asegúrate de que el token tenga los permisos necesarios
3. Ejecuta `npm run setup-github` para reconfigurar
4. Verifica que la variable `GITHUB_TOKEN` esté configurada: `echo $GITHUB_TOKEN`

### Permisos del Token

El token debe tener los siguientes permisos:
- `repo` - Acceso completo a repositorios privados
- `workflow` - Para GitHub Actions (si se usan) 