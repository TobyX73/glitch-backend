import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import productRoutes from '../features/products/productRoutes';
import categoryRoutes from '../features/category/categoryRoutes';
import userRoutes from '../features/users/userRoutes';
import orderRoutes from '../features/orders/orderRoutes';
import webhooksRoutes from '../features/webhooks/webhookRoutes';
import deliveryRoutes from '../features/delivery/deliveryRoutes';
import uploadRoutes from '../features/uploads/uploadRoutes';


const app = express();

// Configuración CORS dinámica
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, móviles, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origen: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Importante para JWT y cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware básico, este funciona como un puente para nuestras res, req
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  console.log('FINALLY ANDA', req.method)
  // Con esto se envia la solicitud para que la pagina responda con un HTTP 200 OK en caso de que este funcionando
  res.sendStatus(200);
});

app.get ('/dashboard', (req, res) => {
  console.log('DASHBOARD ACCEDIDO', req.method);
  res.sendStatus(200);
});

//Endpoint para productos
app.use('/api/products', productRoutes); 
app.use('/api/categories', categoryRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhooksRoutes); 
app.use('/api/delivery', deliveryRoutes); 
app.use('/api/uploads', uploadRoutes); 

export default app;
