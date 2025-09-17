import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

export const prisma = new PrismaClient();

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Conexion a la db exitosa');
  } catch (error) {
    console.error('Error al conectar', error);
  }
};