# Glitch — Backend

> API REST para e-commerce de indumentaria. Construida con Express + TypeScript, Prisma ORM, PostgreSQL, autenticación JWT, upload de imágenes a Cloudinary e integración con MercadoPago.

🌐 **API en producción:** `https://glitch-backend-uu8n.onrender.com/api`
🔗 **Frontend:** [glitch-frontend](https://github.com/TobyX73/glitch-frontend)

---

## ¿Qué resuelve este backend?

Glitch necesitaba una API capaz de manejar un flujo de e-commerce completo: autenticación por roles, catálogo de productos con imágenes, gestión de órdenes y procesamiento de pagos. El backend fue diseñado como una API REST con separación clara de responsabilidades, tipado estricto con TypeScript y despliegue continuo en Render.

---

## Stack tecnológico

| Área | Tecnología |
|------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Autenticación | JWT + bcrypt |
| Upload de imágenes | Multer + Cloudinary |
| Pagos | MercadoPago SDK |
| Validaciones | class-validator + class-transformer |
| Deploy | Render |

---

## Endpoints principales

### Usuarios (`/api/users`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | ❌ | Registrar usuario |
| POST | `/login` | ❌ | Iniciar sesión → devuelve JWT |
| GET | `/profile` | ✅ | Perfil del usuario autenticado |
| GET | `/` | 🔒 admin | Listar todos los usuarios |
| GET | `/:id` | 🔒 admin | Ver usuario específico |
| PUT | `/:id/role` | 🔒 admin | Cambiar rol del usuario |

### Productos (`/api/products`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ❌ | Listar todos los productos |
| GET | `/:id` | ❌ | Ver producto específico |
| POST | `/` | 🔒 admin | Crear producto (multipart/form-data) |
| PUT | `/:id` | 🔒 admin | Actualizar producto |
| PATCH | `/:id/stock` | 🔒 admin | Actualizar stock |
| DELETE | `/:id` | 🔒 admin | Eliminar producto |

### Órdenes (`/api/orders`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ✅ | Listar órdenes (admin: todas; user: las propias) |
| GET | `/:id` | ✅ | Ver orden específica |
| POST | `/` | ✅ | Crear nueva orden |
| PATCH | `/:id/status` | 🔒 admin | Actualizar estado (`pending` / `confirmed` / `cancelled`) |

### Categorías (`/api/categories`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | ❌ | Listar categorías |
| GET | `/:id` | ❌ | Ver categoría específica |

### Pagos (`/api/payments`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/create-preference` | ✅ | Crear preferencia de pago en MercadoPago |
| POST | `/webhook` | ❌ | Webhook de notificaciones de MercadoPago |

---

## Modelo de datos (Prisma)

```
User
├── id, firstName, lastName, email, password (hash)
├── role: "user" | "admin"
└── orders: Order[]

Product
├── id, name, description, price, stock
├── images: String[] (URLs de Cloudinary)
├── sizes: String[]
└── category: Category

Order
├── id, totalAmount, status, paymentMethod
├── shippingAddress: { street, city, state, zipCode, country }
├── user: User
└── items: OrderItem[]

OrderItem
├── quantity, size, price (precio al momento de compra)
└── product: Product
```

---

## Autenticación y autorización

El sistema usa JWT con dos niveles de protección:

- **`authMiddleware`**: verifica que el token sea válido. Protege rutas de usuario autenticado.
- **`adminMiddleware`**: verifica además que `role === "admin"`. Protege rutas sensibles del panel de administración.

Las contraseñas se hashean con `bcrypt` antes de persistirse. El token incluye `userId` y `role` en el payload.

---

## Upload de imágenes

Los productos admiten múltiples imágenes. El flujo es:

1. El cliente envía `multipart/form-data` con los archivos
2. `Multer` intercepta y procesa los archivos en memoria
3. Cada archivo se sube a **Cloudinary**, que devuelve una URL pública segura
4. Las URLs se persisten en el campo `images[]` del producto en la base de datos

---

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/TobyX73/glitch-backend.git
cd glitch-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Completar con tus credenciales (ver sección siguiente)

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Iniciar en desarrollo
npm run dev
```

## Scripts disponibles

```bash
npm run dev          # Desarrollo con hot-reload (ts-node-dev)
npm run dev:public   # Desarrollo + túnel ngrok (para probar webhooks)
npm run build        # Compila TypeScript + migra DB + genera cliente Prisma
npm start            # Ejecuta el build compilado
```

---

## Estructura del proyecto

```
src/
├── index.ts              # Entry point, configuración de Express
├── routes/               # Definición de rutas por módulo
├── controllers/          # Lógica de negocio por endpoint
├── middlewares/
│   ├── auth.middleware.ts
│   └── admin.middleware.ts
├── services/             # Lógica reutilizable (cloudinary, etc.)
└── types/                # Tipos e interfaces TypeScript

prisma/
└── schema.prisma         # Modelos de base de datos
```

---

## Decisiones técnicas destacadas

**¿Por qué Prisma y no un ORM más tradicional?**
Prisma genera tipos TypeScript automáticamente a partir del schema, lo que elimina errores de runtime por discrepancias entre el modelo y la base de datos. La integración con TypeScript es nativa.

**¿Por qué Cloudinary para imágenes?**
Evita almacenar archivos en el servidor (Render no tiene sistema de archivos persistente en el plan gratuito) y provee URLs optimizadas con transformaciones on-the-fly.

**¿Por qué MercadoPago?**
Es el procesador de pagos dominante en América Latina, con SDK oficial para Node.js y soporte para pagos con tarjeta, transferencia y efectivo en la región.

---

## Deploy

El backend está desplegado en **Render** con las siguientes consideraciones:

- El build ejecuta `prisma generate` + `prisma migrate deploy` + `tsc` automáticamente
- Las variables de entorno se configuran en el dashboard de Render
- El plan gratuito hiberna tras inactividad — la primera request puede demorar ~30 segundos

---
