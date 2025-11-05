import { obtenerProductos } from "../api.js";
import { Carrito } from "../entities/cart.js";
import { HistorialPedidos } from "../entities/orders.js";
import { UI } from "../ui.js";

const socket = io("http://localhost:3000");
const carrito = new Carrito();
const historial = new HistorialPedidos();

async function init() {
    const productos = await obtenerProductos();
    UI.renderProductos(productos, (p) => {
        carrito.agregarProducto(p);
        UI.renderCarrito(carrito, (id) => {
            carrito.eliminarProducto(id);
            UI.renderCarrito(carrito, (id2) => carrito.eliminarProducto(id2));
        });
    });

    UI.renderCarrito(carrito, (id) => {
        carrito.eliminarProducto(id);
        UI.renderCarrito(carrito, (id2) => carrito.eliminarProducto(id2));
    });
}

document.getElementById("btn-enviar").addEventListener("click", () => {
    const pedido = { items: carrito.obtenerLista() };
    socket.emit("nuevoPedido", pedido);
    carrito.vaciar();
    UI.renderCarrito(carrito);
});

socket.on("estadoPedido", (pedidoActualizado) => {
    // Actualizar o agregar en el historial
    historial.actualizarPedido(pedidoActualizado);

    // Renderizar
    UI.mostrarHistorial(historial.obtenerHistorial());
});


document.getElementById("btn-historial").addEventListener("click", () => {
    UI.mostrarHistorial(historial.obtenerHistorial());
});

document.getElementById("btn-cerrar-historial").addEventListener("click", UI.ocultarHistorial);

init();
