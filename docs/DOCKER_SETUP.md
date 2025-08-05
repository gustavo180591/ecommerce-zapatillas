# Configuración de Docker para el Ecommerce

## Descripción General

Este proyecto incluye configuración completa de Docker para desarrollo local con PostgreSQL y SvelteKit.

## Requisitos Previos

### Instalar Docker
- **Ubuntu/Debian**: `sudo apt install docker.io docker-compose`
- **macOS**: Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
- **Windows**: Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop

### Verificar Instalación
```bash
docker --version
docker compose version
```

## Configuración Inicial

### 1. Iniciar Contenedores
```bash
# Iniciar todos los servicios
docker compose up -d

# Verificar que estén corriendo
docker compose ps
```

### 2. Configurar Base de Datos
```bash
# Sincronizar esquema de Prisma
docker compose exec app npx prisma db push

# Poblar con datos de ejemplo
docker compose exec app npm run db:seed
```

### 3. Acceder a Prisma Studio
```bash
# Opción 1: Usar el script automatizado
npm run docker:studio

# Opción 2: Ejecutar directamente
docker compose exec app npx prisma studio --hostname 0.0.0.0 --port 5555
```

## Servicios Disponibles

### 🐳 **Contenedores**
- **app**: Aplicación SvelteKit (puerto 3000)
- **db**: Base de datos PostgreSQL (puerto 5435)

### 🌐 **URLs de Acceso**
- **Aplicación**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555
- **Base de datos**: localhost:5435

## Comandos Útiles

### Gestión de Contenedores
```bash
# Iniciar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs app
docker compose logs db

# Reiniciar servicios
docker compose restart
```

### Base de Datos
```bash
# Sincronizar esquema
docker compose exec app npx prisma db push

# Generar cliente Prisma
docker compose exec app npx prisma generate

# Poblar datos
docker compose exec app npm run db:seed

# Abrir Prisma Studio
docker compose exec app npx prisma studio --hostname 0.0.0.0 --port 5555
```

### Desarrollo
```bash
# Instalar dependencias
docker compose exec app npm install

# Ejecutar linting
docker compose exec app npm run lint

# Ejecutar formateo
docker compose exec app npm run format

# Verificar tipos
docker compose exec app npm run check
```

## Estructura de Archivos

### Docker Compose
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"  # SvelteKit
      - "5555:5555"  # Prisma Studio
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ecommerce_zapatillas
    volumes:
      - .:/app       # Código fuente
      - /app/node_modules  # Dependencias

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=ecommerce_zapatillas
    ports:
      - "5435:5432"  # PostgreSQL
    volumes:
      - pgdata:/var/lib/postgresql/data
```

### Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## Variables de Entorno

### Configuración de Base de Datos
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/ecommerce_zapatillas"
```

**Nota**: Dentro del contenedor, la base de datos está disponible en `db:5432`, pero desde el host es `localhost:5435`.

## Scripts Automatizados

### Prisma Studio
```bash
# Script automatizado
npm run docker:studio

# Equivale a:
./scripts/prisma-studio.sh
```

### GitHub Setup
```bash
# Configurar autenticación de GitHub
npm run setup-github
```

## Troubleshooting

### Error: Port already in use
```bash
# Verificar qué está usando el puerto
sudo lsof -i :3000
sudo lsof -i :5555
sudo lsof -i :5435

# Detener servicios locales si es necesario
sudo service postgresql stop
```

### Error: Can't reach database
```bash
# Verificar que los contenedores estén corriendo
docker compose ps

# Verificar logs de la base de datos
docker compose logs db

# Reiniciar servicios
docker compose restart
```

### Error: Permission denied
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar:
newgrp docker
```

### Error: Volume mount failed
```bash
# Verificar permisos del directorio
ls -la

# Ajustar permisos si es necesario
chmod 755 .
```

## Desarrollo con Docker

### Flujo de Trabajo Recomendado

1. **Iniciar entorno**:
   ```bash
   docker compose up -d
   ```

2. **Configurar base de datos**:
   ```bash
   docker compose exec app npx prisma db push
   docker compose exec app npm run db:seed
   ```

3. **Desarrollar**:
   - Editar archivos en tu editor local
   - Los cambios se reflejan automáticamente en el contenedor
   - La aplicación está disponible en http://localhost:3000

4. **Gestionar base de datos**:
   ```bash
   npm run docker:studio
   # Abrir http://localhost:5555
   ```

5. **Detener entorno**:
   ```bash
   docker compose down
   ```

### Ventajas del Entorno Docker

- ✅ **Consistencia**: Mismo entorno en todas las máquinas
- ✅ **Aislamiento**: No interfiere con instalaciones locales
- ✅ **Simplicidad**: Un comando para iniciar todo
- ✅ **Portabilidad**: Funciona en cualquier sistema con Docker
- ✅ **Desarrollo**: Hot reload automático

## Próximos Pasos

1. ✅ Configurar Docker Compose
2. ✅ Iniciar servicios
3. ✅ Configurar base de datos
4. ✅ Acceder a Prisma Studio
5. 🔄 Desarrollar funcionalidades de ecommerce
6. 🔄 Configurar CI/CD con Docker 