import { Router } from 'express';
import multer from 'multer';
import { uploadController } from './uploadController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { adminOnly } from '../../middlewares/roleMiddleware';

const router = Router();

// Configurar multer para recibir archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB por imagen
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Todas las rutas requieren autenticación y rol de admin
router.use(authMiddleware);
router.use(adminOnly);

// Subir una sola imagen
router.post('/image', upload.single('image'), uploadController.uploadSingleImage);

// Subir múltiples imágenes (máximo 5)
router.post('/images', upload.array('images', 5), uploadController.uploadMultipleImages);

// Eliminar imagen
router.delete('/image', uploadController.deleteImage);

export default router;
