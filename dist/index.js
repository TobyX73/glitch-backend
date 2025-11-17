"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
const server_1 = __importDefault(require("./config/server"));
require("reflect-metadata");
const PORT = 3000;
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        server_1.default.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1);
    }
};
startServer();
