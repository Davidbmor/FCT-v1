import { carritoGlobal } from "../../lib/cart";

export default function RemoveItemIsland({ id }) {
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
