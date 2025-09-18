import { Router } from "express";
import { productController } from "./productController";

const router = Router();

router.get('/', productController.getAll);           // GET /api/products - Ver todos los productos     // GET /api/products/search?q= - Buscar productos (si tienes este método)
router.get('/:id', productController.getById); 

router.post('/' ,productController.create); // POST desde admin

export default router;

