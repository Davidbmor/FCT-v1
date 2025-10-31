const socket = io("http://localhost:3000");
const contenedor = document.getElementById("pedidos");

socket.on("listaPedidos", (lista) => {
    renderPedidos(lista);
});

function renderPedidos(lista) {
    contenedor.innerHTML = "";
    if (lista.length === 0) {
        contenedor.textContent = "No hay pedidos aún.";
        return;
    }

    lista.forEach(p => {
        const div = document.createElement("div");
        div.className = "pedido";

        const items = p.items.map(i => `<li>${i.nombre} - $${i.precio}</li>`).join("");

        div.innerHTML = `
      <b>Pedido ID:</b> ${p.id} <br>
      <b>Estado actual:</b> ${p.estado.toUpperCase()} <br>
      <b>Productos:</b>
      <ul>${items}</ul>
      <label>Cambiar estado:</label>
      <select>
        <option value="recibido">Recibido</option>
        <option value="preparando">Preparando</option>
        <option value="listo">Listo</option>
      </select>
      <button>Actualizar</button>
    `;

        const select = div.querySelector("select");
        select.value = p.estado;
        div.querySelector("button").addEventListener("click", () => {
            const nuevoEstado = select.value;
            socket.emit("actualizarEstado", { id: p.id, nuevoEstado });
        });

        contenedor.appendChild(div);
    });
}
