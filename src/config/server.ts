import * as express from 'express';

const app = express();

// Middleware básico
app.use(express.json());

// Ruta básica
app.get('/', (req, res) => {
  console.log('FINALLY ANDA');
});

export default app;
