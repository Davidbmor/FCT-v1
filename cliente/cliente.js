const socket = io("http://localhost:3000");

let carrito = [];

fetch("http://localhost:3000/productos")
    .then(res => res.json())
    .then(productos => {
        const cont = document.getElementById("productos");
        productos.forEach(p => {
            const div = document.createElement("div");
            div.className = "producto";
            div.innerHTML = `
        <b>${p.nombre}</b> - $${p.precio}
        <br>
        <button>Agregar</button>
      `;
            div.querySelector("button").addEventListener("click", () => agregarAlCarrito(p));
            cont.appendChild(div);
        });
    });

function agregarAlCarrito(p) {
    carrito.push(p);
    renderCarrito();
}

function renderCarrito() {
    const lista = document.getElementById("carrito");
    lista.innerHTML = "";
    carrito.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.nombre} - $${p.precio}`;
        lista.appendChild(li);
    });
}

document.getElementById("enviarPedido").addEventListener("click", () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    socket.emit("nuevoPedido", { items: carrito });
    document.getElementById("estado").textContent = "⏳ Pedido enviado...";
});

socket.on("estadoPedido", (pedido) => {
    document.getElementById("estado").textContent =
        `🧾 Estado del pedido: ${pedido.estado.toUpperCase()}`;
});
