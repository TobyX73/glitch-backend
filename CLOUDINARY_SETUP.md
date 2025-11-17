# Guía de Configuración y Uso - Cloudinary Upload

## 🔧 CONFIGURACIÓN INICIAL

### 1. Crear cuenta en Cloudinary

1. Ve a https://cloudinary.com y registrate (es gratis)
2. Una vez dentro del Dashboard, encontrarás tus credenciales en la sección **Dashboard**

### 2. Configurar variables de entorno

Edita tu archivo `.env` y reemplaza estos valores con tus credenciales reales:

```env
CLOUDINARY_CLOUD_NAME="tu_cloud_name"     # Ej: "glitch-store"
CLOUDINARY_API_KEY="tu_api_key"           # Ej: "123456789012345"
CLOUDINARY_API_SECRET="tu_api_secret"     # Ej: "abcdefghijklmnopqrstuvwxyz123"
```

**¿Dónde encontrar estas credenciales?**
- Cloud Name: Está visible en el Dashboard de Cloudinary
- API Key y API Secret: En **Settings → Access Keys** (sección "Account Details")

### 3. Configurar en Render (Producción)

1. Ve a tu servicio en Render Dashboard
2. **Environment** → **Environment Variables**
3. Agrega las 3 variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## 📡 ENDPOINTS DISPONIBLES

### 1. Subir una sola imagen
**Endpoint:** `POST /api/uploads/image`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
image: [archivo de imagen]
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "data": {
    "url": "https://res.cloudinary.com/glitch-store/image/upload/v1234567890/glitch-products/abc123.jpg",
    "publicId": "glitch-products/abc123",
    "width": 1200,
    "height": 1200,
    "format": "jpg"
  }
}
```

---

### 2. Subir múltiples imágenes (máximo 5)
**Endpoint:** `POST /api/uploads/images`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
images: [archivo1.jpg]
images: [archivo2.jpg]
images: [archivo3.jpg]
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "3 imagen(es) subida(s) exitosamente",
  "data": [
    {
      "url": "https://res.cloudinary.com/glitch-store/image/upload/v1234567890/glitch-products/img1.jpg",
      "publicId": "glitch-products/img1",
      "width": 1200,
      "height": 1200,
      "format": "jpg"
    },
    {
      "url": "https://res.cloudinary.com/glitch-store/image/upload/v1234567890/glitch-products/img2.jpg",
      "publicId": "glitch-products/img2",
      "width": 800,
      "height": 600,
      "format": "jpg"
    }
  ]
}
```

---

### 3. Eliminar imagen
**Endpoint:** `DELETE /api/uploads/image`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "publicId": "glitch-products/abc123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Imagen eliminada exitosamente"
}
```

---

## 🧪 TESTING CON POSTMAN

### Configuración previa:
1. Obtén tu token de admin (login como admin)
2. Guárdalo en una variable de entorno de Postman: `ADMIN_TOKEN`

### Test 1: Subir imagen simple

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/uploads/image` (local) o `https://tu-backend.onrender.com/api/uploads/image` (producción)
3. **Headers:**
   - `Authorization`: `Bearer {{ADMIN_TOKEN}}`
4. **Body:**
   - Selecciona `form-data`
   - Key: `image` (cambiar tipo a "File")
   - Value: Selecciona una imagen de tu computadora
5. **Send**

### Test 2: Subir múltiples imágenes

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/uploads/images`
3. **Headers:**
   - `Authorization`: `Bearer {{ADMIN_TOKEN}}`
4. **Body:**
   - Selecciona `form-data`
   - Key: `images` (cambiar tipo a "File") - selecciona imagen 1
   - Key: `images` (mismo nombre, tipo "File") - selecciona imagen 2
   - Key: `images` (mismo nombre, tipo "File") - selecciona imagen 3
5. **Send**

---

## 💻 INTEGRACIÓN EN EL FRONTEND

### Opción 1: Subir imágenes primero, luego crear producto

```typescript
// 1. Subir imágenes
const uploadImages = async (files: File[]) => {
  const formData = new FormData();
  
  // Múltiples imágenes
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await axios.post(
    'https://tu-backend.com/api/uploads/images',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data.data; // Array de { url, publicId, ... }
};

// 2. Crear producto con las URLs
const createProduct = async (productData, imageFiles) => {
  // Primero subir imágenes
  const uploadedImages = await uploadImages(imageFiles);

  // Transformar a formato del backend
  const images = uploadedImages.map((img, index) => ({
    url: img.url,
    order: index,
    isMain: index === 0 // Primera imagen es la principal
  }));

  // Crear producto
  const response = await axios.post(
    'https://tu-backend.com/api/products',
    {
      name: productData.name,
      description: productData.description,
      basePrice: parseFloat(productData.price),
      categoryId: parseInt(productData.categoryId),
      images: images,
      variants: productData.variants,
      isActive: true
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};
```

### Opción 2: Subir una por una con preview

```typescript
const uploadSingleImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(
    'https://tu-backend.com/api/uploads/image',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data.data; // { url, publicId, ... }
};

// Uso en componente React
const [uploadedImages, setUploadedImages] = useState([]);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  for (const file of Array.from(files)) {
    try {
      const uploaded = await uploadSingleImage(file);
      setUploadedImages(prev => [...prev, uploaded]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
};
```

---

## 🚀 FLUJO COMPLETO RECOMENDADO

### Desde el frontend:

1. **Usuario selecciona imágenes** (input file con multiple)
2. **Preview local** (opcional, usando `URL.createObjectURL`)
3. **Click en "Guardar"** → llama a `uploadImages(files)`
4. **Espera respuesta** con las URLs de Cloudinary
5. **Usa esas URLs** para crear el producto con `POST /api/products`

### Ejemplo completo:

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  try {
    // 1. Subir imágenes a Cloudinary
    const uploadedImages = await uploadImages(selectedFiles);
    
    // 2. Preparar datos del producto
    const productData = {
      name: formData.name,
      description: formData.description,
      basePrice: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId),
      images: uploadedImages.map((img, idx) => ({
        url: img.url,
        order: idx,
        isMain: idx === 0
      })),
      variants: formData.variants.map(v => ({
        size: v.size,
        stock: parseInt(v.stock)
      })),
      isActive: true
    };
    
    // 3. Crear producto
    const response = await axios.post('/api/products', productData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Producto creado:', response.data);
    
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📝 CARACTERÍSTICAS IMPLEMENTADAS

✅ **Límite de tamaño:** 5MB por imagen
✅ **Límite de cantidad:** Máximo 5 imágenes por request
✅ **Optimización automática:** Cloudinary optimiza calidad
✅ **Redimensionamiento:** Máximo 1200x1200px
✅ **Formato automático:** Cloudinary elige el mejor formato
✅ **Validación:** Solo acepta archivos de imagen (image/*)
✅ **Seguridad:** Solo admins pueden subir imágenes
✅ **CDN global:** Las imágenes se sirven desde CDN rápido

---

## ⚠️ LÍMITES DEL PLAN GRATUITO DE CLOUDINARY

- **Almacenamiento:** 25 GB
- **Ancho de banda:** 25 GB/mes
- **Transformaciones:** 25,000/mes
- **Imágenes:** Ilimitadas

Para la mayoría de tiendas pequeñas/medianas, el plan gratuito es más que suficiente.

---

## 🛠️ TROUBLESHOOTING

### Error: "No se proporcionó ninguna imagen"
- Asegúrate de usar `Content-Type: multipart/form-data`
- En Postman/frontend, usa `FormData` y append con nombre correcto (`image` o `images`)

### Error: "Solo se permiten archivos de imagen"
- Verifica que el archivo sea JPG, PNG, GIF, WebP, etc.
- Revisa el MIME type del archivo

### Error: "Not allowed by CORS"
- Verifica que tu frontend esté en `FRONTEND_URL` del `.env`
- En Render, actualiza la variable de entorno

### Error relacionado con Cloudinary credentials
- Verifica que las 3 variables estén configuradas correctamente
- Revisa que no haya espacios extras en `.env`
- En Render, asegúrate de haber guardado las variables

---

## 🎉 ¡LISTO!

Ahora podés:
1. Subir imágenes a Cloudinary desde el frontend
2. Obtener URLs públicas optimizadas
3. Crear productos usando esas URLs
4. Las imágenes persisten incluso después de redesplegar en Render
