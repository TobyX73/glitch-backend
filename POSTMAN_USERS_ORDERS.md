# Guía Postman - Gestión de Usuarios y Órdenes

Esta guía contiene ejemplos de requests para probar los endpoints de usuarios y órdenes del backend.

---

## 🔐 AUTENTICACIÓN

### Variables de entorno recomendadas:
- `BASE_URL`: `http://localhost:5173` (desarrollo) o `https://tu-backend.com` (producción)
- `ADMIN_TOKEN`: Token JWT del administrador
- `USER_TOKEN`: Token JWT de usuario regular

---

## 👥 GESTIÓN DE USUARIOS (ADMIN)

### 1. Listar Todos los Usuarios
**Endpoint:** `GET {{BASE_URL}}/api/users`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Query Params (opcionales):**
- `search`: Buscar por nombre o email

**Ejemplo sin búsqueda:**
```
GET http://localhost:5173/api/users
```

**Ejemplo con búsqueda:**
```
GET http://localhost:5173/api/users?search=toby
GET http://localhost:5173/api/users?search=admin
GET http://localhost:5173/api/users?search=@gmail.com
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "email": "tobybecerra04@gmail.com",
      "firstName": "toby",
      "lastName": "becerra",
      "phone": "+54 11 1234-5678",
      "role": "user",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2025-11-16T10:00:00.000Z",
      "updatedAt": "2025-11-16T10:00:00.000Z"
    },
    {
      "id": 2,
      "email": "glitchurban.store@gmail.com",
      "firstName": "Admin",
      "lastName": "Glitch",
      "phone": "+54 11 9876-5432",
      "role": "admin",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2025-11-16T10:00:00.000Z",
      "updatedAt": "2025-11-16T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Obtener Detalle de Usuario (con estadísticas e historial)
**Endpoint:** `GET {{BASE_URL}}/api/users/:id`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Ejemplo:**
```
GET http://localhost:5173/api/users/2
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": 2,
    "email": "juan.perez@email.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+54 11 1234-5678",
    "role": "user",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2024-01-14T00:00:00.000Z",
    "updatedAt": "2024-01-14T00:00:00.000Z",
    "statistics": {
      "totalOrders": 5,
      "completedOrders": 2
    },
    "address": {
      "street": "Av. Corrientes 1234, Piso 5, Dpto B",
      "city": "CABA",
      "state": "Buenos Aires",
      "zipCode": "1043",
      "country": "Argentina"
    },
    "orderHistory": [
      {
        "id": 1,
        "orderNumber": "ORD-2024-001",
        "date": "2024-11-14T10:30:00.000Z",
        "status": "PAYMENT_PENDING",
        "total": 28000,
        "items": [
          {
            "productName": "Remera Cyberpunk 2077",
            "quantity": 1,
            "size": "L",
            "price": 15000
          },
          {
            "productName": "Hoodie GTA V",
            "quantity": 1,
            "size": "XL",
            "price": 13000
          }
        ]
      },
      {
        "id": 12,
        "orderNumber": "ORD-2024-012",
        "date": "2024-04-19T09:57:00.000Z",
        "status": "PAID",
        "total": 15000,
        "items": [
          {
            "productName": "Remera The Witcher",
            "quantity": 1,
            "size": "M",
            "price": 15000
          }
        ]
      },
      {
        "id": 45,
        "orderNumber": "ORD-2024-045",
        "date": "2024-05-09T14:22:00.000Z",
        "status": "SHIPPED",
        "total": 32000,
        "items": [
          {
            "productName": "Buzo Fortnite",
            "quantity": 2,
            "size": "L",
            "price": 16000
          }
        ]
      },
      {
        "id": 57,
        "orderNumber": "ORD-2024-057",
        "date": "2024-06-04T18:45:00.000Z",
        "status": "DELIVERED",
        "total": 45000,
        "items": [
          {
            "productName": "Remera God of War",
            "quantity": 3,
            "size": "XL",
            "price": 15000
          }
        ]
      }
    ]
  }
}
```

**Nota sobre el campo `address`:**
- Si el usuario no tiene órdenes, `address` será `undefined`
- La dirección se obtiene de la última orden (más reciente)

---

### 3. Eliminar Usuario por ID
**Endpoint:** `DELETE {{BASE_URL}}/api/users/:id`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Ejemplo:**
```
DELETE http://localhost:5173/api/users/5
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

**Errores comunes:**
- `400`: "No puedes eliminar tu propia cuenta" (si intentas eliminar el admin actual)
- `404`: "Usuario no encontrado"

---

## 📦 GESTIÓN DE ÓRDENES

### 4. Verificar Stock del Carrito (antes de checkout)
**Endpoint:** `POST {{BASE_URL}}/api/orders/verify-cart`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "items": [
    {
      "productId": 10,
      "variantId": 101,
      "quantity": 2
    },
    {
      "productId": 11,
      "size": "XL",
      "quantity": 1
    }
  ]
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Todos los productos están disponibles",
  "data": {
    "allAvailable": true,
    "items": [
      {
        "productId": 10,
        "variantId": 101,
        "size": "M",
        "available": true,
        "message": "Disponible",
        "currentPrice": 15000,
        "availableStock": 10
      },
      {
        "productId": 11,
        "variantId": 105,
        "size": "XL",
        "available": true,
        "message": "Disponible",
        "currentPrice": 13000,
        "availableStock": 5
      }
    ]
  }
}
```

**Respuesta con stock insuficiente (200):**
```json
{
  "success": true,
  "message": "Algunos productos no están disponibles",
  "data": {
    "allAvailable": false,
    "items": [
      {
        "productId": 10,
        "variantId": 101,
        "size": "M",
        "available": true,
        "availableStock": 10
      },
      {
        "productId": 11,
        "size": "XL",
        "available": false,
        "message": "Stock insuficiente. Disponible: 0",
        "availableStock": 0
      }
    ]
  }
}
```

---

### 5. Crear Orden (Checkout Simple)
**Endpoint:** `POST {{BASE_URL}}/api/orders/checkout`

**Headers:**
```
Content-Type: application/json
```

**Body para usuario registrado:**
```json
{
  "userId": 2,
  "items": [
    {
      "productId": 10,
      "variantId": 101,
      "quantity": 1
    },
    {
      "productId": 11,
      "size": "XL",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "Av. Corrientes 1234, Piso 5, Dpto B",
    "city": "CABA",
    "state": "Buenos Aires",
    "zipCode": "1043",
    "country": "Argentina"
  },
  "notes": "Dejar en conserjería si no estoy"
}
```

**Body para invitado (sin cuenta):**
```json
{
  "guestEmail": "juan.comprador@email.com",
  "guestName": "Juan Pérez",
  "items": [
    {
      "productId": 10,
      "size": "L",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "Calle Falsa 123",
    "city": "Rosario",
    "state": "Santa Fe",
    "zipCode": "2000",
    "country": "Argentina"
  }
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "id": 123,
    "userId": 2,
    "guestEmail": null,
    "guestName": null,
    "total": 28000,
    "status": "PENDING",
    "mpExternalReference": "order_1731849600000_abc123xyz",
    "notes": "Dejar en conserjería si no estoy",
    "shippingInfo": {
      "street": "Av. Corrientes 1234, Piso 5, Dpto B",
      "city": "CABA",
      "state": "Buenos Aires",
      "zipCode": "1043",
      "country": "Argentina"
    },
    "createdAt": "2024-11-17T10:30:00.000Z",
    "updatedAt": "2024-11-17T10:30:00.000Z",
    "items": [
      {
        "id": 456,
        "productId": 10,
        "quantity": 1,
        "price": 15000,
        "productName": "Remera Cyberpunk 2077",
        "productImage": "https://example.com/image.jpg"
      },
      {
        "id": 457,
        "productId": 11,
        "quantity": 1,
        "price": 13000,
        "productName": "Hoodie GTA V",
        "productImage": "https://example.com/image2.jpg"
      }
    ]
  }
}
```

**Errores comunes:**
- `400`: "Stock insuficiente para [producto] talla [size]. Disponible: X"
- `400`: "Variante no encontrada para [producto] talla [size]"
- `400`: "Datos de entrada inválidos" (validación de DTO)

---

### 6. Crear Orden + Preferencia de MercadoPago (Checkout Completo)
**Endpoint:** `POST {{BASE_URL}}/api/orders/checkout-complete`

**Headers:**
```
Content-Type: application/json
```

**Body:** (mismo formato que checkout simple)

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Orden creada y preferencia de pago generada exitosamente",
  "data": {
    "order": {
      "id": 123,
      "status": "PAYMENT_PENDING",
      "total": 28000,
      "items": [...]
    },
    "payment": {
      "preferenceId": "1234567890-abcd-1234-5678-1234567890ab",
      "paymentUrl": "https://www.mercadopago.com/checkout/v1/redirect?pref_id=1234567890",
      "sandboxPaymentUrl": "https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=1234567890"
    }
  }
}
```

---

### 7. Obtener Detalle de Orden
**Endpoint:** `GET {{BASE_URL}}/api/orders/:id`

**Headers:** (ninguno requerido, es pública para tracking)

**Ejemplo:**
```
GET http://localhost:5173/api/orders/123
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Orden obtenida exitosamente",
  "data": {
    "id": 123,
    "userId": 2,
    "total": 28000,
    "status": "PAYMENT_PENDING",
    "shippingInfo": {
      "street": "Av. Corrientes 1234, Piso 5, Dpto B",
      "city": "CABA",
      "state": "Buenos Aires",
      "zipCode": "1043",
      "country": "Argentina"
    },
    "items": [...],
    "payment": {
      "id": 789,
      "amount": 28000,
      "status": "PENDING",
      "mpPreferenceId": "1234567890",
      "createdAt": "2024-11-17T10:30:00.000Z"
    }
  }
}
```

---

### 8. Listar Órdenes (Admin - con filtros)
**Endpoint:** `GET {{BASE_URL}}/api/orders`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Query Params (todos opcionales):**
- `status`: `PENDING`, `PAYMENT_PENDING`, `PAID`, `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `userId`: Filtrar por usuario específico
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 12)
- `startDate`: Fecha inicio (ISO 8601)
- `endDate`: Fecha fin (ISO 8601)

**Ejemplos:**
```
GET http://localhost:5173/api/orders
GET http://localhost:5173/api/orders?status=PENDING
GET http://localhost:5173/api/orders?userId=2
GET http://localhost:5173/api/orders?status=PAID&page=1&limit=10
GET http://localhost:5173/api/orders?startDate=2024-11-01&endDate=2024-11-30
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Órdenes obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "userId": 2,
      "total": 28000,
      "status": "PAYMENT_PENDING",
      "createdAt": "2024-11-14T10:30:00.000Z",
      "items": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 9. Actualizar Estado de Orden (Admin)
**Endpoint:** `PATCH {{BASE_URL}}/api/orders/:id/status`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body - Confirmar orden (marcar como pagada):**
```json
{
  "status": "PAID",
  "notes": "Pago confirmado manualmente por admin"
}
```

**Body - Marcar como en preparación:**
```json
{
  "status": "PREPARING",
  "notes": "Orden confirmada y en preparación"
}
```

**Body - Marcar como enviada:**
```json
{
  "status": "SHIPPED",
  "notes": "Enviado por Correo Argentino - Tracking: CA123456789AR"
}
```

**Body - Marcar como entregada:**
```json
{
  "status": "DELIVERED",
  "notes": "Entregado exitosamente"
}
```

**Body - Cancelar orden:**
```json
{
  "status": "CANCELLED",
  "notes": "Cancelada por falta de stock"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Estado de orden actualizado exitosamente",
  "data": {
    "id": 123,
    "status": "PREPARING",
    "notes": "Orden confirmada y en preparación",
    "updatedAt": "2024-11-17T14:25:00.000Z",
    "items": [...]
  }
}
```

**Estados válidos:**
- `PENDING` - Orden creada, esperando pago
- `PAYMENT_PENDING` - Preferencia de MP creada, esperando confirmación
- `PAID` - ✅ Pagada/Confirmada (usado para estadísticas de "completadas")
- `PREPARING` - En preparación
- `SHIPPED` - Enviada
- `DELIVERED` - Entregada
- `CANCELLED` - Cancelada
- `REFUNDED` - Reembolsada

---

### 10. Listar Mis Órdenes (Usuario autenticado)
**Endpoint:** `GET {{BASE_URL}}/api/orders/user/my-orders`

**Headers:**
```
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json
```

**Query Params (opcionales):**
- `status`: Filtrar por estado
- `page`: Número de página
- `limit`: Items por página

**Ejemplo:**
```
GET http://localhost:5173/api/orders/user/my-orders
GET http://localhost:5173/api/orders/user/my-orders?status=PAID
```

**Respuesta:** (mismo formato que listar órdenes admin)

---

## 🔑 FLUJO TÍPICO DE USO

### Para el Frontend de Admin:

1. **Login como admin** → obtener `ADMIN_TOKEN`
2. **Listar usuarios** → `GET /api/users` (con búsqueda opcional)
3. **Ver detalle de usuario** → `GET /api/users/:id` (incluye estadísticas + historial)
4. **Listar todas las órdenes** → `GET /api/orders` (con filtros por estado, usuario, fechas)
5. **Confirmar/Actualizar orden** → `PATCH /api/orders/:id/status`

### Para el Frontend de Cliente:

1. **Verificar stock** → `POST /api/orders/verify-cart`
2. **Crear orden + pago** → `POST /api/orders/checkout-complete`
3. **Redirigir a MercadoPago** → usar `payment.paymentUrl`
4. **Ver mis órdenes** → `GET /api/orders/user/my-orders` (requiere login)
5. **Ver detalle de orden** → `GET /api/orders/:id` (tracking público)

---

## 📊 NOTAS IMPORTANTES

### Sobre Variantes en Items:
- **Recomendado:** Enviar `variantId` (más preciso)
- **Alternativa:** Enviar `size` ("S", "M", "L", "XL", "XXL") y el backend buscará la variante
- Si no envías ni `variantId` ni `size`, el checkout puede fallar

### Sobre Estadísticas de Usuario:
- `totalOrders`: Cuenta **todas** las órdenes del usuario
- `completedOrders`: Cuenta solo órdenes con `status: "PAID"`

### Sobre la Dirección del Usuario:
- Se obtiene de la `shippingInfo` de la **última orden** (más reciente)
- Si el usuario no tiene órdenes, el campo `address` será `undefined`

### Sobre el Número de Orden:
- Formato: `ORD-2024-XXX` donde XXX es el `id` con padding de 3 dígitos
- Ejemplos: `ORD-2024-001`, `ORD-2024-123`, `ORD-2024-999`

---

## 🧪 TESTING RÁPIDO

### Colección completa de requests de prueba:

```bash
# 1. Login Admin
POST http://localhost:5173/api/users/login
Body: {"email": "admin@glitch.com", "password": "tu_password"}

# 2. Listar usuarios (copiar token del paso 1)
GET http://localhost:5173/api/users
Header: Authorization: Bearer <TOKEN>

# 3. Buscar usuario
GET http://localhost:5173/api/users?search=juan
Header: Authorization: Bearer <TOKEN>

# 4. Ver detalle con historial
GET http://localhost:5173/api/users/2
Header: Authorization: Bearer <TOKEN>

# 5. Verificar carrito
POST http://localhost:5173/api/orders/verify-cart
Body: {"items": [{"productId": 1, "size": "M", "quantity": 1}]}

# 6. Crear orden
POST http://localhost:5173/api/orders/checkout
Body: {...}

# 7. Listar órdenes pendientes
GET http://localhost:5173/api/orders?status=PENDING
Header: Authorization: Bearer <TOKEN>

# 8. Confirmar orden
PATCH http://localhost:5173/api/orders/1/status
Header: Authorization: Bearer <TOKEN>
Body: {"status": "PAID", "notes": "Confirmada"}
```

---

**¡Listo!** Ahora podés importar estos ejemplos en Postman o usar directamente desde tu frontend.
