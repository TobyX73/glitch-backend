"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.prisma = new client_1.PrismaClient();
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        console.log('Conexion a la db exitosa');
    }
    catch (error) {
        console.error('Error al conectar', error);
    }
};
exports.connectDatabase = connectDatabase;
