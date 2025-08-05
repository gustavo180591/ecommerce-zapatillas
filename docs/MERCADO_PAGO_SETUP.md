# Integración de Mercado Pago para Argentina

## Descripción General

Este proyecto incluye una integración completa con Mercado Pago para procesar pagos en Argentina, incluyendo todos los métodos de pago locales y cumpliendo con las regulaciones argentinas.

## Características Implementadas

### ✅ **Funcionalidades Completas**
- Checkout Pro (redirección a Mercado Pago)
- Soporte para moneda ARS (pesos argentinos)
- Campo DNI obligatorio para Argentina
- Páginas de redirección (éxito, fallo, pendiente)
- Webhook para notificaciones de pago
- Actualización automática del estado de órdenes
- Interfaz responsive con Tailwind CSS

### 🇦🇷 **Específico para Argentina**
- Moneda: ARS (pesos argentinos)
- DNI: Campo obligatorio en formularios
- Métodos de pago: Tarjetas, transferencias, efectivo
- URLs de redirección configuradas para localhost

## Configuración Inicial

### 1. **Obtener Credenciales de Mercado Pago**

#### Registrarse en Mercado Pago
1. Ve a [Mercado Pago Argentina](https://www.mercadopago.com.ar/)
2. Crea una cuenta de vendedor
3. Accede al [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers)

#### Crear Aplicación
1. En el panel, selecciona "Tus integraciones"
2. Haz clic en "Crear aplicación"
3. Nombra la aplicación (ej. "Ecommerce Zapatillas")
4. Selecciona "Checkout Pro" como producto

#### Obtener Credenciales
- **Public Key**: Para el frontend (inicia con TEST-)
- **Access Token**: Para el backend (inicia con TEST-)

### 2. **Configurar Variables de Entorno**

Edita el archivo `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_zapatillas"
MERCADO_PAGO_ACCESS_TOKEN="TEST-TU_ACCESS_TOKEN_AQUI"
```

**Reemplaza** `TEST-TU_ACCESS_TOKEN_AQUI` con tu access token real.

## Estructura del Proyecto

### 📁 **Archivos de Integración**

#### API Routes
- `src/routes/api/checkout/+server.ts` - Genera preferencias de pago
- `src/routes/api/webhook/+server.ts` - Maneja notificaciones

#### Páginas de Checkout
- `src/routes/checkout/+page.svelte` - Formulario de checkout
- `src/routes/success/+page.svelte` - Pago exitoso
- `src/routes/failure/+page.svelte` - Error en pago
- `src/routes/pending/+page.svelte` - Pago pendiente

#### Base de Datos
- `prisma/schema.prisma` - Esquema con campo `paymentId`

## Flujo de Pago

### 1. **Cliente Completa Formulario**
```
Cliente → /checkout → Llena datos (email, DNI, etc.)
```

### 2. **Crear Preferencia de Pago**
```
Frontend → POST /api/checkout → Mercado Pago API
```

### 3. **Redirección a Mercado Pago**
```
Cliente → Mercado Pago → Selecciona método de pago
```

### 4. **Procesamiento del Pago**
```
Mercado Pago → Procesa pago → Notifica resultado
```

### 5. **Redirección de Vuelta**
```
Cliente → /success, /failure, o /pending
```

### 6. **Webhook (Asíncrono)**
```
Mercado Pago → POST /api/webhook → Actualiza estado en BD
```

## Configuración de URLs

### **URLs de Redirección**
```javascript
back_urls: {
  success: 'http://localhost:3000/success',
  failure: 'http://localhost:3000/failure',
  pending: 'http://localhost:3000/pending'
}
```

### **URL de Webhook**
```javascript
notification_url: 'http://localhost:3000/api/webhook'
```

**Nota**: Para producción, reemplaza `localhost:3000` con tu dominio.

## Pruebas

### **Credenciales de Prueba**

#### Tarjetas de Prueba
- **Visa**: 4509 9535 6623 3704
- **Mastercard**: 5031 4332 1540 6351
- **American Express**: 3711 8030 3257 522

#### Datos de Prueba
- **CVV**: Cualquier número de 3 dígitos
- **Fecha**: Cualquier fecha futura
- **DNI**: Cualquier número de 8 dígitos

### **Probar el Checkout**

1. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

2. **Ir al checkout**:
   ```
   http://localhost:3000/checkout
   ```

3. **Completar formulario**:
   - Email: test@example.com
   - DNI: 12345678
   - Nombre y apellido

4. **Procesar pago**:
   - Usar tarjetas de prueba
   - Verificar redirección

## Webhooks

### **Configuración para Pruebas Locales**

Para probar webhooks localmente, usa ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto local
ngrok http 3000

# Configurar URL en Mercado Pago
# Usar la URL generada por ngrok + /api/webhook
```

### **Configuración en Mercado Pago**

1. Ve al panel de desarrolladores
2. Selecciona tu aplicación
3. Ve a "Webhooks"
4. Agrega la URL: `https://tu-ngrok-url.ngrok.io/api/webhook`

## Producción

### **Credenciales de Producción**

1. Solicita credenciales de producción en el panel
2. Actualiza `MERCADO_PAGO_ACCESS_TOKEN` en producción
3. Configura URLs de producción en el código

### **URLs de Producción**

```javascript
back_urls: {
  success: 'https://tu-dominio.com/success',
  failure: 'https://tu-dominio.com/failure',
  pending: 'https://tu-dominio.com/pending'
},
notification_url: 'https://tu-dominio.com/api/webhook'
```

### **Despliegue**

#### Vercel
```bash
# Configurar variables de entorno en Vercel
MERCADO_PAGO_ACCESS_TOKEN=APP-TU_ACCESS_TOKEN_PRODUCCION
DATABASE_URL=tu_url_de_produccion
```

#### VPS con Docker
```bash
# Usar docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

## Consideraciones para Argentina

### **Moneda y Precios**
- Usar `currency_id: 'ARS'` en todas las preferencias
- Los precios deben estar en pesos argentinos
- Considerar IVA si aplica

### **Métodos de Pago**
- **Tarjetas**: Visa, Mastercard, American Express
- **Transferencias**: Transferencias bancarias
- **Efectivo**: Rapipago, Pago Fácil, Boleto Bancario

### **DNI Obligatorio**
- Campo requerido para todos los pagos
- Validación en frontend y backend
- Cumple con regulaciones argentinas

### **Logística**
- Integrar con Correo Argentino, OCA, o Andreani
- Usar campo `address` para envíos
- Considerar costos de envío por provincia

## Troubleshooting

### **Error: "Can't reach database server"**
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar conexión
pg_isready -h localhost -p 5432
```

### **Error: "Invalid access token"**
- Verificar que el token esté correcto en `.env`
- Asegurarse de que el token sea de prueba para desarrollo
- Verificar que no haya espacios extra

### **Error: "DNI required"**
- Asegurarse de que el campo DNI esté presente
- Verificar que el DNI tenga 8 dígitos
- Validar en el formulario de checkout

### **Webhook no funciona**
- Verificar que ngrok esté corriendo
- Confirmar que la URL esté configurada en Mercado Pago
- Revisar logs del servidor para errores

## Próximos Pasos

### **Mejoras Sugeridas**
1. **Carrito de compras**: Implementar gestión de carrito
2. **Múltiples productos**: Soporte para varios items
3. **Descuentos**: Códigos de descuento
4. **Envíos**: Cálculo de costos de envío
5. **Emails**: Confirmaciones automáticas
6. **Dashboard**: Panel de administración

### **Integraciones Adicionales**
1. **Printful**: Para zapatillas personalizadas
2. **Proveedores locales**: Reducir costos de envío
3. **Analytics**: Seguimiento de conversiones
4. **CRM**: Gestión de clientes

## Recursos Útiles

- [Documentación Mercado Pago](https://www.mercadopago.com.ar/developers)
- [SDK de Mercado Pago](https://github.com/mercadopago/sdk-nodejs)
- [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
- [Herramientas de Prueba](https://www.mercadopago.com.ar/developers/panel/credentials) 