# 📦 Guía de Testing - Productos con Variantes e Imágenes

## Base URL
```
http://localhost:3000/api/products
```

---

## 🔐 Headers Requeridos (Para operaciones de Admin)

```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT_AQUI
```

---

## 1️⃣ CREAR PRODUCTO (POST /api/products)

### Request Body:
```json
{
  "name": "Remera Cyberpunk 2077",
  "description": "Remera de algodón 100% con diseño exclusivo inspirado en Cyberpunk 2077. Estampado de alta calidad que no se destiñe. Ideal para gamers y fanáticos del género cyberpunk.",
  "basePrice": 15000,
  "categoryId": 1,
  "isActive": true,
  "images": [
    {
      "url": "https://ejemplo.com/imagenes/cyberpunk-remera-front.jpg",
      "order": 0,
      "isMain": true
    },
    {
      "url": "https://ejemplo.com/imagenes/cyberpunk-remera-back.jpg",
      "order": 1,
      "isMain": false
    },
    {
      "url": "https://ejemplo.com/imagenes/cyberpunk-remera-detail.jpg",
      "order": 2,
      "isMain": false
    }
  ],
  "variants": [
    {
      "size": "S",
      "stock": 10,
      "sku": "CYB-REM-S-001"
    },
    {
      "size": "M",
      "stock": 25,
      "sku": "CYB-REM-M-001"
    },
    {
      "size": "L",
      "stock": 15,
      "sku": "CYB-REM-L-001"
    },
    {
      "size": "XL",
      "stock": 8,
      "sku": "CYB-REM-XL-001"
    },
    {
      "size": "XXL",
      "stock": 5,
      "sku": "CYB-REM-XXL-001"
    }
  ]
}
```

### Respuesta Exitosa (201):
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": 1,
    "name": "Remera Cyberpunk 2077",
    "description": "Remera de algodón 100%...",
    "basePrice": 15000,
    "categoryId": 1,
    "isActive": true,
    "createdAt": "2024-11-17T05:30:00.000Z",
    "updatedAt": "2024-11-17T05:30:00.000Z",
    "category": {
      "id": 1,
      "name": "Remeras"
    },
    "images": [
      {
        "id": 1,
        "url": "https://ejemplo.com/imagenes/cyberpunk-remera-front.jpg",
        "order": 0,
        "isMain": true
      },
      {
        "id": 2,
        "url": "https://ejemplo.com/imagenes/cyberpunk-remera-back.jpg",
        "order": 1,
        "isMain": false
      },
      {
        "id": 3,
        "url": "https://ejemplo.com/imagenes/cyberpunk-remera-detail.jpg",
        "order": 2,
        "isMain": false
      }
    ],
    "variants": [
      {
        "id": 1,
        "size": "L",
        "stock": 15,
        "sku": "CYB-REM-L-001"
      },
      {
        "id": 2,
        "size": "M",
        "stock": 25,
        "sku": "CYB-REM-M-001"
      },
      {
        "id": 3,
        "size": "S",
        "stock": 10,
        "sku": "CYB-REM-S-001"
      },
      {
        "id": 4,
        "size": "XL",
        "stock": 8,
        "sku": "CYB-REM-XL-001"
      },
      {
        "id": 5,
        "size": "XXL",
        "stock": 5,
        "sku": "CYB-REM-XXL-001"
      }
    ],
    "totalStock": 63,
    "mainImage": "https://ejemplo.com/imagenes/cyberpunk-remera-front.jpg"
  }
}
```

---

## 2️⃣ OBTENER TODOS LOS PRODUCTOS (GET /api/products)

### Sin autenticación (público)

### Query Params Opcionales:
```
?page=1
&limit=12
&categoryId=1
&search=cyberpunk
&minPrice=10000
&maxPrice=20000
&isActive=true
&size=M
```

### Ejemplo con filtros:
```
GET http://localhost:3000/api/products?categoryId=1&size=M&page=1&limit=10
```

### Respuesta Exitosa (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Remera Cyberpunk 2077",
      "description": "Remera de algodón 100%...",
      "basePrice": 15000,
      "categoryId": 1,
      "isActive": true,
      "createdAt": "2024-11-17T05:30:00.000Z",
      "updatedAt": "2024-11-17T05:30:00.000Z",
      "category": {
        "id": 1,
        "name": "Remeras"
      },
      "images": [...],
      "variants": [...],
      "totalStock": 63,
      "mainImage": "https://ejemplo.com/imagenes/cyberpunk-remera-front.jpg"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  }
}
```

---

## 3️⃣ OBTENER PRODUCTO POR ID (GET /api/products/:id)

### Sin autenticación (público)

```
GET http://localhost:3000/api/products/1
```

### Respuesta Exitosa (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Remera Cyberpunk 2077",
    "description": "Remera de algodón 100%...",
    "basePrice": 15000,
    "categoryId": 1,
    "isActive": true,
    "createdAt": "2024-11-17T05:30:00.000Z",
    "updatedAt": "2024-11-17T05:30:00.000Z",
    "category": {
      "id": 1,
      "name": "Remeras"
    },
    "images": [
      {
        "id": 1,
        "url": "https://ejemplo.com/imagenes/cyberpunk-remera-front.jpg",
        "order": 0,
        "isMain": true
      },
      {
        "id": 2,
        "url": "https://ejemplo.com/imagenes/cyberpunk-remera-back.jpg",
        "order": 1,
        "isMain": false
      },
      {
        "id": 3,
        "url": "https://ejemplo.com/imagenes/cyberpunk-remera-detail.jpg",
        "order": 2,
        "isMain": false
      }
    ],
    "variants": [
      {
        "id": 1,
        "size": "L",
        "stock": 15,
        "sku": "CYB-REM-L-001"
      },
      {
        "id": 2,
        "size": "M",
        "stock": 25,
        "sku": "CYB-REM-M-001"
      },
      {
        "id": 3,
        "size": "S",
        "stock": 10,
        "sku": "CYB-REM-S-001"
      },
      {
        "id": 4,
        "size": "XL",
        "stock": 8,
        "sku": "CYB-REM-XL-001"
      },
      {
        "id": 5,
        "size": "XXL",
        "stock": 5,
        "sku": "CYB-REM-XXL-001"
      }
    ],
    "totalStock": 63,
    "mainImage": "https://ejemplo.com/imagenes/cyberpunk-remera-front.jpg"
  }
}
```

---

## 4️⃣ ACTUALIZAR PRODUCTO (PUT /api/products/:id)

### Requiere: JWT + Admin

### Request Body (Actualización parcial):
```json
{
  "basePrice": 18000,
  "description": "Remera de algodón 100% con diseño exclusivo inspirado en Cyberpunk 2077. NUEVA EDICIÓN LIMITADA. Estampado de alta calidad que no se destiñe.",
  "variants": [
    {
      "size": "S",
      "stock": 5,
      "sku": "CYB-REM-S-001"
    },
    {
      "size": "M",
      "stock": 30,
      "sku": "CYB-REM-M-001"
    },
    {
      "size": "L",
      "stock": 20,
      "sku": "CYB-REM-L-001"
    },
    {
      "size": "XL",
      "stock": 12,
      "sku": "CYB-REM-XL-001"
    },
    {
      "size": "XXL",
      "stock": 8,
      "sku": "CYB-REM-XXL-001"
    }
  ]
}
```

### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Producto actualizado exitosamente",
  "data": {
    "id": 1,
    "name": "Remera Cyberpunk 2077",
    "basePrice": 18000,
    "variants": [...],
    "totalStock": 75
  }
}
```

---

## 5️⃣ ACTUALIZAR STOCK DE UNA VARIANTE (PATCH /api/products/:id/stock)

### Requiere: JWT + Admin

### Request Body:
```json
{
  "size": "M",
  "stock": 50
}
```

### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Stock actualizado exitosamente",
  "data": {
    "id": 2,
    "productId": 1,
    "size": "M",
    "stock": 50,
    "sku": "CYB-REM-M-001"
  }
}
```

---

## 6️⃣ ELIMINAR PRODUCTO (DELETE /api/products/:id)

### Requiere: JWT + Admin

```
DELETE http://localhost:3000/api/products/1
```

### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

**Nota:** Es un soft delete, el producto se marca como `isActive: false`

---

## 7️⃣ CREAR ORDEN CON VARIANTES (POST /api/orders/checkout)

### Request Body:
```json
{
  "items": [
    {
      "productId": 1,
      "size": "M",
      "quantity": 2
    },
    {
      "productId": 1,
      "size": "L",
      "quantity": 1
    }
  ],
  "guestEmail": "cliente@email.com",
  "guestName": "Juan Pérez",
  "shippingAddress": {
    "street": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "zipCode": "1043",
    "country": "Argentina"
  },
  "notes": "Entregar en horario de oficina"
}
```

### Respuesta Exitosa (201):
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "id": 1,
    "total": 45000,
    "status": "PENDING",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "variantId": 2,
        "size": "M",
        "quantity": 2,
        "price": 15000,
        "productName": "Remera Cyberpunk 2077"
      },
      {
        "id": 2,
        "productId": 1,
        "variantId": 1,
        "size": "L",
        "quantity": 1,
        "price": 15000,
        "productName": "Remera Cyberpunk 2077"
      }
    ]
  }
}
```

---

## ⚠️ Validaciones Importantes

### Tallas Válidas:
- ✅ S, M, L, XL, XXL
- ❌ Cualquier otra talla será rechazada

### Imágenes:
- Al menos 1 imagen requerida
- Solo 1 imagen puede ser principal (`isMain: true`)
- Si no se marca ninguna como principal, la primera se marca automáticamente

### Variantes:
- Al menos 1 variante requerida
- No puede haber tallas duplicadas en el mismo producto
- El stock se maneja individualmente por talla

### Stock:
- Al crear una orden, el stock se descuenta automáticamente de la variante específica
- Si una talla se queda sin stock, ese producto no se mostrará al filtrar por esa talla

---

## 🎯 Casos de Uso Comunes

### Producto con todas las tallas:
```json
{
  "variants": [
    {"size": "S", "stock": 10},
    {"size": "M", "stock": 20},
    {"size": "L", "stock": 15},
    {"size": "XL", "stock": 10},
    {"size": "XXL", "stock": 5}
  ]
}
```

### Producto con tallas limitadas:
```json
{
  "variants": [
    {"size": "M", "stock": 30},
    {"size": "L", "stock": 25}
  ]
}
```

### Buscar productos con talla M disponible:
```
GET /api/products?size=M
```

---

## 📝 Notas Adicionales

1. **Todos los endpoints de lectura (GET)** son públicos
2. **Todos los endpoints de escritura (POST, PUT, PATCH, DELETE)** requieren autenticación JWT + rol admin
3. El campo `totalStock` es calculado sumando el stock de todas las variantes
4. El campo `mainImage` devuelve la URL de la imagen marcada como principal
5. Las imágenes se ordenan por el campo `order` de menor a mayor
6. Las variantes se ordenan alfabéticamente por `size`

---

## 🔍 Testing Rápido

1. **Crear categoría** (si no existe)
2. **Crear producto** con el ejemplo de arriba
3. **Listar productos** para verificar
4. **Obtener por ID** para ver detalle completo
5. **Actualizar stock** de talla M
6. **Crear orden** con 2 productos talla M
7. **Verificar que el stock se descontó** correctamente
