import { connectDatabase} from './config/database';
import app from './config/server';
import 'reflect-metadata';

const PORT = 3000;


const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

 startServer();
