import { Router } from "express";
import { productController } from "./productController";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminOnly } from "../../middlewares/roleMiddleware";

const router = Router();

// Rutas públicas (lectura)
router.get('/', productController.getAll);          
router.get('/:id', productController.getById);      

// Rutas protegidas - Solo administradores
router.post('/', authMiddleware, adminOnly, productController.create);         
router.put('/:id', authMiddleware, adminOnly, productController.update);      
router.patch('/:id/stock', authMiddleware, adminOnly, productController.updateStock); 
router.delete('/:id', authMiddleware, adminOnly, productController.delete);     

export default router;

