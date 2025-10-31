import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app as any);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Simulación de productos
const productos = [
  { id: 1, nombre: "Ensalada César", precio: 5 },
  { id: 2, nombre: "Pasta Boloñesa", precio: 8 },
  { id: 3, nombre: "Pizza Margarita", precio: 9 },
  { id: 4, nombre: "Tiramisú", precio: 4 }
];

// Simulación de pedidos
const pedidos: Record<string, any> = {};

// Endpoint para obtener productos
app.get("/productos", (req, res) => {
  res.json(productos);
});

// Cuando un cliente se conecta por socket
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Cliente envía un pedido
  socket.on("nuevoPedido", (pedido) => {
    console.log("Pedido recibido:", pedido);

    pedidos[socket.id] = { ...pedido, estado: "recibido" };
    socket.emit("estadoPedido", pedidos[socket.id]);

    // Simulamos que el cocinero cambia de estado después de unos segundos
    setTimeout(() => {
      pedidos[socket.id].estado = "preparando";
      socket.emit("estadoPedido", pedidos[socket.id]);
    }, 3000);

    setTimeout(() => {
      pedidos[socket.id].estado = "listo";
      socket.emit("estadoPedido", pedidos[socket.id]);
    }, 6000);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
    delete pedidos[socket.id];
  });
});


httpServer.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});