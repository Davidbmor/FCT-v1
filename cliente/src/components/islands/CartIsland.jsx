import { useEffect, useState } from "preact/hooks";
import { carritoGlobal } from "../../lib/cart";
import { socket } from "../../lib/socket";

// Eliminar item (NO es isla, es un componente normal)
function RemoveItem({ id }) {
  function remove() {
    carritoGlobal.eliminarProducto(id);
    window.dispatchEvent(new CustomEvent("cart-updated"));
  }

  return (
    <button class="object-delete" onClick={remove}>
      Eliminar
    </button>
  );
}

export default function CartIsland() {
  const [items, setItems] = useState(carritoGlobal.obtenerLista());
  const [total, setTotal] = useState(carritoGlobal.total());

  function refresh() {
    setItems([...carritoGlobal.obtenerLista()]);
    setTotal(carritoGlobal.total());
  }

  useEffect(() => {
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  function enviarPedido() {
    const pedido = { items };
    socket.emit("nuevoPedido", pedido);
    carritoGlobal.vaciar();
    refresh();
  }

  return (
    <>
      {items.map((item) => (
        <div class="object">
          <div class="object-img"></div>
          <div class="object-content">
            <div class="object-text">
              <h3 class="object-title">{item.nombre}</h3>
              <h4 class="object-ammount">
                cantidad: <span>{item.cantidad}</span>
              </h4>
              <h4 class="object-ammount">
                precio: <span>{item.precio}</span>
              </h4>
            </div>

            <RemoveItem id={item.id} />
          </div>
        </div>
      ))}

      <div class="total">
        <a class="order" onClick={enviarPedido}>
          Ordenar Comanda
        </a>
      </div>
    </>
  );
}
