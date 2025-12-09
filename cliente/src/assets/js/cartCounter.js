import { carritoGlobal } from "../../lib/cart.js";

/**
 * Actualiza el contador visual del carrito con estilos según cantidad
 * Cambia colores y animaciones al alcanzar el límite de 10 productos
 */
function actualizarContador() {
  const contador = document.getElementById('cart-counter');
  if (contador) {
    const cantidad = carritoGlobal.cantidadTotal();
    contador.textContent = cantidad;
    
    const redAlert = contador.parentElement;
    if (redAlert) {
      if (cantidad > 0) {
        redAlert.style.display = 'flex';
        
        if (cantidad >= 10) {
          redAlert.style.background = 'linear-gradient(90deg, rgba(255, 67, 67, 1) 0%, rgba(139, 0, 0, 1) 100%)';
          redAlert.classList.add('at-limit');
        } else {
          redAlert.style.background = 'linear-gradient(90deg, rgba(255, 67, 67, 1) 0%, rgba(255, 104, 11, 1) 100%)';
          redAlert.classList.remove('at-limit');
        }
      } else {
        redAlert.style.display = 'none';
        redAlert.classList.remove('at-limit');
      }
    }
  }
}

function hacerParpadear() {
  const redAlert = document.querySelector('.redAlert');
  if (redAlert) {
    redAlert.classList.add('blink-alert');
    setTimeout(() => {
      redAlert.classList.remove('blink-alert');
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', actualizarContador);
window.addEventListener('cart-updated', actualizarContador);
window.addEventListener('cart-limit-reached', hacerParpadear);
