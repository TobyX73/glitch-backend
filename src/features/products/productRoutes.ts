import { Router } from "express";
import { productController } from "./productController";

const router = Router();

router.get('/', productController.getAll);          
router.get('/:id', productController.getById);      


router.post('/', productController.create);         
router.put('/:id', productController.update);      
router.patch('/:id/stock', productController.updateStock); 
router.delete('/:id', productController.delete);     

export default router;

