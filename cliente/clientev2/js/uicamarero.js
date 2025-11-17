// uiCamarero.js
export function renderPedidos(pedidos, onChangeEstado) {
    const contenedor = document.getElementById("lista-pedidos");
    contenedor.innerHTML = "";

    if (pedidos.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No hay pedidos en este momento.";
        contenedor.appendChild(msg);
        return;
    }

    pedidos.forEach((pedido) => {
        const card = document.createElement("div");
        card.className = "pedido-card";

        const titulo = document.createElement("h3");
        titulo.textContent = `Pedido #${pedido.id.slice(0, 8)}`;

        const lista = document.createElement("ul");
        pedido.items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.nombre} × ${item.cantidad} - ${item.precio} €`;
            lista.appendChild(li);
        });

        const estado = document.createElement("p");
        estado.textContent = `Estado: ${pedido.estado}`;

        const select = document.createElement("select");
        ["recibido", "en preparación", "listo", "entregado"].forEach((e) => {
            const option = document.createElement("option");
            option.value = e;
            option.textContent = e.charAt(0).toUpperCase() + e.slice(1);
            if (e === pedido.estado) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener("change", () => {
            onChangeEstado(pedido.id, select.value);
        });

        card.append(titulo, lista, estado, select);
        contenedor.appendChild(card);
    });
}
