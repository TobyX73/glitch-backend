import { Router } from "express";
import { categoryController } from "./categoryController";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminOnly } from "../../middlewares/roleMiddleware";

const router = Router();

// Rutas públicas (lectura)
router.get('/', categoryController.getAll);           
router.get('/:id', categoryController.getById);      

// Rutas protegidas - Solo administradores
router.post('/', authMiddleware, adminOnly, categoryController.create);         
router.put('/:id', authMiddleware, adminOnly, categoryController.update);        
router.delete('/:id', authMiddleware, adminOnly, categoryController.delete);    

export default router;