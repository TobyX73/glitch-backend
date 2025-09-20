import { Router } from "express";
import { userController } from "./userController";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminOnly } from "../../middlewares/roleMiddleware";

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.use(authMiddleware); // Aplicar middleware a todas las rutas siguientes

// Rutas del usuario autenticado
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.patch('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);

router.get('/', adminOnly, userController.getAllUsers);
router.get('/:id', adminOnly, userController.getUserById);
router.delete('/:id', adminOnly, userController.deleteUserById);

export default router;