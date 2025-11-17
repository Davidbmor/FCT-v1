import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

console.log("✅ Conectado a la base de datos MySQL (XAMPP)");

// --- Tipos ---
interface Pedido {
  id: string;
  socketId: string;
  items: any[];
  estado: string;
  fecha: string;
}

// --- Almacenamiento temporal de pedidos (en memoria) ---
const pedidos: Record<string, Pedido> = {};

// --- Endpoint para obtener productos disponibles ---
app.get("/productos", async (req, res) => {
  try {
    const [productos] = await db.query(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.disponible
      FROM productos p
      WHERE p.disponible = true
    `);

    const [alergenos] = await db.query(`
      SELECT pa.producto_id, a.nombre, a.icono
      FROM producto_alergeno pa
      JOIN alergenos a ON a.id = pa.alergeno_id
    `);

    const productosConAlergenos = (productos as any[]).map((p) => ({
      ...p,
      alergenos: (alergenos as any[])
        .filter((a) => a.producto_id === p.id)
        .map((a) => ({ nombre: a.nombre, icono: a.icono })),
    }));

    res.json(productosConAlergenos);
  } catch (err) {
    console.error("❌ Error obteniendo productos:", err);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

// --- Comunicación en tiempo real (Socket.io) ---
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  // Cliente envía un nuevo pedido
  socket.on("nuevoPedido", (pedido) => {
    const id = randomUUID();
    const nuevoPedido: Pedido = {
      id,
      socketId: socket.id,
      items: pedido.items,
      estado: "recibido",
      fecha: new Date().toISOString(),
    };

    pedidos[id] = nuevoPedido;

    // Notificamos al cliente
    socket.emit("estadoPedido", nuevoPedido);

    // Notificamos a todos los camareros que hay un nuevo pedido
    io.emit("listaPedidos", Object.values(pedidos));

    console.log(`🧾 Pedido nuevo ${id} recibido de ${socket.id}`);
  });

  // El camarero cambia el estado de un pedido
  socket.on("actualizarEstado", ({ id, nuevoEstado }) => {
    const pedido = pedidos[id];
    if (!pedido) return;

    pedido.estado = nuevoEstado;

    // Notificar al cliente correspondiente
    io.to(pedido.socketId).emit("estadoPedido", pedido);

    // Notificar a todos los camareros
    io.emit("listaPedidos", Object.values(pedidos));

    console.log(`📦 Pedido ${id} actualizado a "${nuevoEstado}"`);
  });

  // Camarero solicita la lista actual de pedidos al conectarse
  socket.on("obtenerPedidos", () => {
    socket.emit("listaPedidos", Object.values(pedidos));
  });

  // Cliente se desconecta
  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

// --- Iniciar servidor ---
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});
