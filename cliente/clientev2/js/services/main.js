import { obtenerProductos } from "../api.js";
import { Carrito } from "../entities/cart.js";
import { HistorialPedidos } from "../entities/orders.js";
import { renderProductos, renderCarrito, mostrarHistorial, ocultarHistorial } from "../ui.js";

const socket = io("http://localhost:3000");
const carrito = new Carrito();
const historial = new HistorialPedidos();

async function init() {
    const productos = await obtenerProductos();
    renderProductos(productos, (p) => {
        carrito.agregarProducto(p);
        renderCarrito(carrito, (id) => {
            carrito.eliminarProducto(id);
            renderCarrito(carrito, (id2) => carrito.eliminarProducto(id2));
        });
    });

    renderCarrito(carrito, (id) => {
        carrito.eliminarProducto(id);
        renderCarrito(carrito, (id2) => carrito.eliminarProducto(id2));
    });
}

document.getElementById("btn-enviar").addEventListener("click", () => {
    const pedido = { items: carrito.obtenerLista() };
    socket.emit("nuevoPedido", pedido);
    carrito.vaciar();
    renderCarrito(carrito);
});

socket.on("estadoPedido", (pedidoActualizado) => {
    historial.actualizarPedido(pedidoActualizado);
    renderHistorial(historial.obtenerHistorial());
});


document.getElementById("btn-historial").addEventListener("click", () => {
    mostrarHistorial(historial.obtenerHistorial());
});

document.getElementById("btn-cerrar-historial").addEventListener("click", ocultarHistorial);

init();
