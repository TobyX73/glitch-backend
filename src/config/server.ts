import 'reflect-metadata';
import express from 'express';
import productRoutes from '../features/products/productRoutes';
import categoryRoutes from '../features/category/categoryRoutes';
import userRoutes from '../features/users/userRoutes';
import orderRoutes from '../features/orders/orderRoutes';
import webhooksRoutes from '../features/webhooks/webhookRoutes';


const app = express();

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

export default app;
