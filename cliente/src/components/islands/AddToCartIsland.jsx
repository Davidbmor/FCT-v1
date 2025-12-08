import { socket } from "../../lib/socket";
import { carritoGlobal } from "../../lib/cart";

export default function AddToCartIsland({ producto }) {
  function add() {
    const cantidadActual = carritoGlobal.cantidadTotal();
    
    if (cantidadActual >= 10) {
      // Hacer parpadear el círculo rojo cuando alcanza el límite
      window.dispatchEvent(new CustomEvent("cart-limit-reached"));
      return;
    }
    
    carritoGlobal.agregarProducto(producto);
    window.dispatchEvent(new CustomEvent("cart-updated"));
  }

  return (
    <a onClick={add} class="order">
      <i class="fa-solid fa-plus"></i> Pedir
    </a>
  );
}
