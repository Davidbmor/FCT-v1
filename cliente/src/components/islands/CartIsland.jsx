import { useEffect, useState } from "preact/hooks";
import { carritoGlobal } from "../../lib/cart";
import { socket } from "../../lib/socket";
import { historial } from "../../lib/historial";

function RemoveItem({ id }) {
  function remove() {
    carritoGlobal.eliminarProducto(id);
    window.dispatchEvent(new CustomEvent("cart-updated"));
  }

  return (
    <div class="object-options">
      <button class="object-delete" onClick={remove}>
        <i class="fa-solid fa-trash"></i> Eliminar
      </button>
    </div>
  );
}

export default function CartIsland() {
  const [items, setItems] = useState(carritoGlobal.obtenerLista());
  const [total, setTotal] = useState(carritoGlobal.total());
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [mensajeError, setMensajeError] = useState("");

  function refresh() {
    setItems([...carritoGlobal.obtenerLista()]);
    setTotal(carritoGlobal.total());
  }

  useEffect(() => {
    window.addEventListener("cart-updated", refresh);
    
    // Verificar si hay un tiempo de espera activo
    const ultimoPedidoTime = localStorage.getItem('ultimoPedidoTime');
    if (ultimoPedidoTime) {
      const tiempoTranscurrido = Date.now() - parseInt(ultimoPedidoTime);
      const tiempoEspera = 3 * 60 * 1000; // 3 minutos en milisegundos
      
      if (tiempoTranscurrido < tiempoEspera) {
        const restante = Math.ceil((tiempoEspera - tiempoTranscurrido) / 1000);
        setTiempoRestante(restante);
      }
    }
    
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [tiempoRestante]);

  function enviarPedido() {
    // Validar máximo 10 productos
    const cantidadTotal = carritoGlobal.cantidadTotal();
    if (cantidadTotal > 10) {
      setMensajeError("No puedes pedir más de 10 productos por pedido");
      setTimeout(() => setMensajeError(""), 4000);
      return;
    }

    // Validar tiempo de espera
    if (tiempoRestante > 0) {
      setMensajeError(`Debes esperar ${formatTime(tiempoRestante)} antes de hacer otro pedido`);
      setTimeout(() => setMensajeError(""), 4000);
      return;
    }

    const pedido = { items };
    socket.emit("nuevoPedido", pedido, (response) => {
      if (response && response.id) {
        // Agregar el pedido al historial con el ID del servidor
        historial.actualizarPedido({
          id: response.id,
          items: items,
          estado: 'en_espera'
        });
        
        // Guardar timestamp del pedido
        localStorage.setItem('ultimoPedidoTime', Date.now().toString());
        setTiempoRestante(3 * 60); // 3 minutos
      }
    });
    
    carritoGlobal.vaciar();
    refresh();
    
    // Actualizar el contador del carrito
    window.dispatchEvent(new CustomEvent("cart-updated"));
    
    // Mostrar mensaje de confirmación
    setPedidoEnviado(true);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setPedidoEnviado(false);
    }, 3000);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <>
      {mensajeError && (
        <div class="error-message">
          <i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem; color: #FF4343; margin-bottom: 12px;"></i>
          <p style="color: #FF4343; font-size: 1.1rem; text-align: center; font-weight: 600;">{mensajeError}</p>
        </div>
      )}

      {pedidoEnviado && (
        <div class="pedido-confirmacion">
          <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: #87c540; margin-bottom: 15px;"></i>
          <h2 style="color: #87c540; font-size: 1.8rem; text-align: center; font-weight: bold;">¡Pedido enviado!</h2>
          <p style="color: #666; text-align: center; margin-top: 10px;">Tu pedido está siendo preparado</p>
        </div>
      )}

      {!pedidoEnviado && items.length === 0 && (
        <div class="empty-cart-message">
          <i class="fa-solid fa-cart-shopping" style="font-size: 5rem; color: #ccc; margin-bottom: 20px;"></i>
          <h2 style="color: #666; font-size: 1.5rem; text-align: center;">Tu carrito está vacío</h2>
          <p style="color: #999; text-align: center; margin-top: 10px;">Añade productos para hacer un pedido</p>
        </div>
      )}

      {!pedidoEnviado && items.length > 0 && (
        <>
          <div class="cart-info">
            <div class="cart-count" style={{
              color: carritoGlobal.cantidadTotal() > 10 ? '#FF4343' : '#666'
            }}>
              <i class="fa-solid fa-box"></i>
              <span>{carritoGlobal.cantidadTotal()} / 10 productos</span>
            </div>
            {tiempoRestante > 0 && (
              <div class="wait-time">
                <i class="fa-solid fa-clock"></i>
                <span>Espera: {formatTime(tiempoRestante)}</span>
              </div>
            )}
          </div>

          {items.map((item) => (
            <div class="object" key={item.id}>
              <div 
                class="object-img" 
                style={{
                  backgroundImage: item.url_imagen ? `url(http://localhost:3000${item.url_imagen})` : 'url(http://localhost:4321/img/sushi.webp)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <div class="object-content">
                <div class="object-text">
                  <h1 class="object-title">{item.nombre}</h1>
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
            <a 
              class={`order order-button ${(carritoGlobal.cantidadTotal() > 10 || tiempoRestante > 0) ? 'disabled' : ''}`}
              onClick={enviarPedido}
              style={{
                opacity: (carritoGlobal.cantidadTotal() > 10 || tiempoRestante > 0) ? '0.5' : '1',
                cursor: (carritoGlobal.cantidadTotal() > 10 || tiempoRestante > 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {tiempoRestante > 0 ? `Espera ${formatTime(tiempoRestante)}` : 'Ordenar Comanda'}
            </a>
          </div>
        </>
      )}
    </>
  );
}
