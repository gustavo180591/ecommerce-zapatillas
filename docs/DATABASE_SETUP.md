# Configuración de Base de Datos PostgreSQL

## Requisitos Previos

### Instalar PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS (con Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Descargar e instalar desde: https://www.postgresql.org/download/windows/

## Configuración Inicial

### 1. Iniciar PostgreSQL
```bash
# Ubuntu/Debian
sudo service postgresql start

# macOS
brew services start postgresql

# Verificar que esté corriendo
pg_isready -h localhost -p 5435
```

### 2. Crear Base de Datos
```bash
# Conectar como usuario postgres
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE ecommerce_zapatillas;

# Verificar que se creó
\l

# Salir
\q
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/ecommerce_zapatillas"
```

**Nota**: Ajusta el usuario y contraseña según tu configuración de PostgreSQL.

## Comandos de Base de Datos

### Sincronizar Esquema
```bash
npm run db:push
```

### Generar Cliente Prisma
```bash
npm run db:generate
```

### Poblar con Datos de Ejemplo
```bash
npm run db:seed
```

### Abrir Prisma Studio
```bash
npm run db:studio
```

## Verificación

### 1. Verificar Conexión
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready -h localhost -p 5435

# Verificar que la base de datos existe
sudo -u postgres psql -c "\l" | grep ecommerce
```

### 2. Verificar Esquema
```bash
# Sincronizar esquema
npm run db:push

# Verificar en Prisma Studio
npm run db:studio
# Abrir http://localhost:5555 en el navegador
```

### 3. Verificar Datos
```bash
# Poblar datos de ejemplo
npm run db:seed

# Verificar en Prisma Studio que aparezcan:
# - 5 productos
# - 2 órdenes
```

## Troubleshooting

### Error: Can't reach database server
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Si no está corriendo, iniciarlo
sudo service postgresql start
```

### Error: Database does not exist
```bash
# Crear la base de datos
sudo -u postgres psql -c "CREATE DATABASE ecommerce_zapatillas;"
```

### Error: Permission denied
```bash
# Verificar permisos del usuario postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Error: Connection refused
```bash
# Verificar que PostgreSQL esté escuchando en el puerto correcto
sudo netstat -tlnp | grep 5435

# Si no está escuchando, reiniciar el servicio
sudo service postgresql restart
```

## Configuración de Desarrollo

### Usuario y Contraseña por Defecto
- **Usuario**: postgres
- **Contraseña**: postgres
- **Puerto**: 5435
- **Base de datos**: ecommerce_zapatillas

### Cambiar Contraseña (Opcional)
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'tu_nueva_contraseña';
\q
```

Luego actualizar el `DATABASE_URL` en `.env`:
```env
DATABASE_URL="postgresql://postgres:tu_nueva_contraseña@localhost:5435/ecommerce_zapatillas"
```

## Próximos Pasos

1. ✅ Configurar PostgreSQL
2. ✅ Crear base de datos
3. ✅ Configurar variables de entorno
4. ✅ Sincronizar esquema
5. ✅ Poblar datos de ejemplo
6. 🔄 Integrar con SvelteKit
7. 🔄 Desarrollar funcionalidades de ecommerce 