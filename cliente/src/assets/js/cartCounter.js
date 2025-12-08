import { carritoGlobal } from "../../lib/cart.js";

function actualizarContador() {
  const contador = document.getElementById('cart-counter');
  if (contador) {
    const cantidad = carritoGlobal.cantidadTotal();
    contador.textContent = cantidad;
    
    // Mostrar u ocultar el badge según la cantidad
    const redAlert = contador.parentElement;
    if (redAlert) {
      if (cantidad > 0) {
        redAlert.style.display = 'flex';
        
        // Cambiar color y añadir animación continua si está en el límite
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
    // Agregar clase de parpadeo
    redAlert.classList.add('blink-alert');
    
    // Remover después de la animación
    setTimeout(() => {
      redAlert.classList.remove('blink-alert');
    }, 1500);
  }
}

// Actualizar al cargar la página
document.addEventListener('DOMContentLoaded', actualizarContador);

// Actualizar cuando se dispare el evento cart-updated
window.addEventListener('cart-updated', actualizarContador);

// Parpadear cuando se alcance el límite
window.addEventListener('cart-limit-reached', hacerParpadear);
