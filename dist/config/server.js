"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const productRoutes_1 = __importDefault(require("../features/products/productRoutes"));
const categoryRoutes_1 = __importDefault(require("../features/category/categoryRoutes"));
const userRoutes_1 = __importDefault(require("../features/users/userRoutes"));
const orderRoutes_1 = __importDefault(require("../features/orders/orderRoutes"));
const webhookRoutes_1 = __importDefault(require("../features/webhooks/webhookRoutes"));
const deliveryRoutes_1 = __importDefault(require("../features/delivery/deliveryRoutes"));
const app = (0, express_1.default)();
// Configuración CORS dinámica
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3001'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sin origin (Postman, curl, móviles, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`CORS bloqueado para origen: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Importante para JWT y cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware básico, este funciona como un puente para nuestras res, req
app.use(express_1.default.json());
// Ruta básica
app.get('/', (req, res) => {
    console.log('FINALLY ANDA', req.method);
    // Con esto se envia la solicitud para que la pagina responda con un HTTP 200 OK en caso de que este funcionando
    res.sendStatus(200);
});
app.get('/dashboard', (req, res) => {
    console.log('DASHBOARD ACCEDIDO', req.method);
    res.sendStatus(200);
});
//Endpoint para productos
app.use('/api/products', productRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/webhooks', webhookRoutes_1.default);
app.use('/api/delivery', deliveryRoutes_1.default);
exports.default = app;
