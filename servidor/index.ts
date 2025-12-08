import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { createConnection } from "./src/config/database.js";
import { ProductoModel } from "./src/models/Producto.js";
import { AlergenoModel } from "./src/models/Alergeno.js";
import { UsuarioModel } from "./src/models/Usuario.js";
import { ProductoController } from "./src/controllers/ProductoController.js";
import { AlergenoController } from "./src/controllers/AlergenoController.js";
import { UsuarioController } from "./src/controllers/UsuarioController.js";
import { createProductoRoutes } from "./src/routes/productoRoutes.js";
import { createAlergenoRoutes } from "./src/routes/alergenoRoutes.js";
import { createUsuarioRoutes } from "./src/routes/usuarioRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/imagenes', express.static('imagenes'));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const db = await createConnection();

const productoModel = new ProductoModel(db);
const alergenoModel = new AlergenoModel(db);
const usuarioModel = new UsuarioModel(db);

const productoController = new ProductoController(productoModel);
const alergenoController = new AlergenoController(alergenoModel);
const usuarioController = new UsuarioController(usuarioModel);

app.use(createProductoRoutes(productoController));
app.use(createAlergenoRoutes(alergenoController));
app.use(createUsuarioRoutes(usuarioController));

interface Pedido {
  id: string;
  socketId: string;
  numeroMesa: number;
  items: any[];
  estado: string;
  fecha: string;
}

const pedidos: Record<string, Pedido> = {};
const socketToMesa: Record<string, number> = {};
const sessionToMesa: Record<string, number> = {};
const mesaToSocket: Record<number, string> = {};
const empleadosSockets: Set<string> = new Set();
let contadorMesas = 0;

io.on("connection", (socket) => {
  const esEmpleado = socket.handshake.auth?.esEmpleado || false;
  const sessionId = socket.handshake.auth?.sessionId;
  
  // Solo asignar número de mesa si NO es empleado
  if (!esEmpleado) {
    let numeroMesa: number;
    
    // Si ya existe una sesión, reutilizar el número de mesa
    if (sessionId && sessionToMesa[sessionId]) {
      numeroMesa = sessionToMesa[sessionId];
      console.log(`🔄 Cliente reconectado: ${socket.id} - Mesa ${numeroMesa} (sesión: ${sessionId})`);
    } else {
      // Nueva sesión, asignar nuevo número de mesa
      contadorMesas++;
      numeroMesa = contadorMesas;
      if (sessionId) {
        sessionToMesa[sessionId] = numeroMesa;
      }
      console.log(`🟢 Cliente conectado: ${socket.id} - Mesa ${numeroMesa}`);
    }
    
    socketToMesa[socket.id] = numeroMesa;
    mesaToSocket[numeroMesa] = socket.id;
    
    // Enviar número de mesa al cliente
    socket.emit("asignarMesa", { numeroMesa });
  } else {
    empleadosSockets.add(socket.id);
    console.log(`🟢 Empleado conectado: ${socket.id}`);
  }

  socket.on("nuevoPedido", (pedido, callback) => {
    const id = randomUUID();
    const numeroMesa = socketToMesa[socket.id] || 0;
    const nuevoPedido: Pedido = {
      id,
      socketId: socket.id,
      numeroMesa,
      items: pedido.items,
      estado: "en_espera",
      fecha: new Date().toISOString(),
    };

    pedidos[id] = nuevoPedido;

    socket.emit("estadoPedido", nuevoPedido);

    io.emit("listaPedidos", Object.values(pedidos));

    console.log(`🧾 Pedido nuevo ${id} recibido de ${socket.id}`);
    
    // Enviar respuesta al cliente con el ID del pedido
    if (callback) {
      callback({ id, estado: 'en_espera' });
    }
  });

  socket.on("actualizarEstado", ({ id, nuevoEstado }) => {
    const pedido = pedidos[id];
    if (!pedido) return;

    pedido.estado = nuevoEstado;

    io.to(pedido.socketId).emit("estadoPedido", pedido);

    io.emit("listaPedidos", Object.values(pedidos));

    console.log(`📦 Pedido ${id} actualizado a "${nuevoEstado}"`);
  });

  socket.on("eliminarPedido", ({ id }) => {
    const pedido = pedidos[id];
    if (!pedido) return;

    delete pedidos[id];

    io.emit("listaPedidos", Object.values(pedidos));

    console.log(`🗑️ Pedido ${id} eliminado`);
  });

  socket.on("obtenerPedidos", () => {
    socket.emit("listaPedidos", Object.values(pedidos));
  });

  socket.on("enviarMensajeChat", (mensaje) => {
    console.log(`💬 Mensaje de ${mensaje.remitente} - Mesa ${mensaje.numeroMesa}: ${mensaje.texto}`);
    
    if (mensaje.remitente === "cliente") {
      // Mensaje del cliente -> enviar solo a todos los empleados
      empleadosSockets.forEach(empleadoSocket => {
        io.to(empleadoSocket).emit("nuevoMensajeChat", mensaje);
      });
    } else if (mensaje.remitente === "camarero") {
      // Mensaje del camarero -> enviar solo a la mesa específica
      const socketMesa = mesaToSocket[mensaje.numeroMesa];
      if (socketMesa) {
        io.to(socketMesa).emit("nuevoMensajeChat", mensaje);
      }
    }
  });

  socket.on("disconnect", () => {
    const numeroMesa = socketToMesa[socket.id];
    if (numeroMesa) {
      console.log(`🔴 Cliente desconectado: ${socket.id} - Mesa ${numeroMesa}`);
      delete socketToMesa[socket.id];
      delete mesaToSocket[numeroMesa];
    }
    
    if (empleadosSockets.has(socket.id)) {
      console.log(`🔴 Empleado desconectado: ${socket.id}`);
      empleadosSockets.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});
