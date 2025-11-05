export const UI = {
    renderProductos: (productos, onAdd) => {
        const contenedor = document.getElementById("productos");
        contenedor.innerHTML = "";
        productos.forEach((p) => {
            const card = document.createElement("div");
            card.className = "card";

            const nombre = document.createElement("h3");
            nombre.textContent = p.nombre;

            const descripcion = document.createElement("p");
            descripcion.textContent = p.descripcion;

            const precio = document.createElement("p");
            precio.innerHTML = `<strong>${p.precio} €</strong>`;

            const alergenosDiv = document.createElement("div");
            alergenosDiv.className = "alergenos";
            p.alergenos.forEach((a) => {
                const span = document.createElement("span");
                span.title = a.nombre;
                span.textContent = a.icono;
                alergenosDiv.appendChild(span);
            });

            const btnAdd = document.createElement("button");
            btnAdd.className = "btn-add";
            btnAdd.textContent = "Añadir";
            btnAdd.addEventListener("click", () => onAdd(p));

            card.append(nombre, descripcion, precio, alergenosDiv, btnAdd);
            contenedor.appendChild(card);
        });
    },

    renderCarrito: (carrito, onRemove) => {
        const lista = document.getElementById("lista-carrito");
        lista.innerHTML = "";

        const items = carrito.obtenerLista();

        if (items.length === 0) {
            const li = document.createElement("li");
            li.textContent = "Tu carrito está vacío";
            lista.appendChild(li);
            return;
        }

        items.forEach((item) => {
            const li = document.createElement("li");

            const texto = document.createElement("span");
            texto.textContent = `${item.nombre} x${item.cantidad} — ${(item.precio * item.cantidad).toFixed(2)} €`;

            const btnRemove = document.createElement("button");
            btnRemove.className = "btn-remove";
            btnRemove.textContent = "-";
            btnRemove.addEventListener("click", () => onRemove(item.id));

            li.append(texto, btnRemove);
            lista.appendChild(li);
        });

        const totalLi = document.createElement("li");
        totalLi.innerHTML = `<strong>Total: ${carrito.total().toFixed(2)} €</strong>`;
        lista.appendChild(totalLi);
    },

    mostrarHistorial: (pedidos) => {
        const modal = document.getElementById("modal-historial");
        const lista = document.getElementById("lista-historial");
        lista.innerHTML = "";

        if (pedidos.length === 0) {
            lista.innerHTML = "<li>No hay pedidos aún</li>";
        } else {
            pedidos.forEach((p, i) => {
                const li = document.createElement("li");
                li.innerHTML = `
            <strong>Pedido ${i + 1}</strong> - ${p.estado}<br>
            ${p.items.map(it => `${it.nombre} x${it.cantidad}`).join(", ")}
          `;
                lista.appendChild(li);
            });
        }

        modal.classList.remove("oculto");
    },

    ocultarHistorial: () => {
        document.getElementById("modal-historial").classList.add("oculto");
    }
};
