import { renderPedidos } from "../uicamarero.js";

const socket = io("http://localhost:3000");

let pedidos = [];

socket.on("connect", () => {
  console.log("🟢 Conectado como camarero:", socket.id);
  socket.emit("registrarUsuario", "camarero");
});

socket.on("listaPedidos", (lista) => {
  pedidos = lista;
  renderPedidos(pedidos, cambiarEstado);
});

function cambiarEstado(id, nuevoEstado) {
  socket.emit("actualizarEstado", { id, nuevoEstado });
}
