import { useEffect, useState } from "preact/hooks";
import { socket, obtenerNumeroMesa } from "../../lib/socket";
import { historial } from "../../lib/historial";

export default function ClientOrdersIsland() {
  const [pedidos, setPedidos] = useState([]);
  const [numeroMesa, setNumeroMesa] = useState(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    // Obtener número de mesa
    const mesa = obtenerNumeroMesa();
    if (mesa) {
      setNumeroMesa(mesa);
    }

    // Escuchar asignación de mesa
    const handleAsignarMesa = ({ numeroMesa: mesa }) => {
      setNumeroMesa(mesa);
    };

    socket.on("asignarMesa", handleAsignarMesa);

    // Escuchar cuando se recibe el estado de un pedido
    socket.on("estadoPedido", (pedido) => {
      historial.actualizarPedido(pedido);
      setPedidos([...historial.obtenerHistorial()]);
    });

    // Cargar el historial al montar el componente
    setPedidos(historial.obtenerHistorial());

    return () => {
      socket.off("asignarMesa", handleAsignarMesa);
      socket.off("estadoPedido");
    };
  }, []);

  const calcularTotalPedido = (items) => {
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'en_espera': return { bg: '#FF781E', text: 'white' };
      case 'en_preparacion': return { bg: '#FFE11F', text: '#1A1A1A' };
      case 'terminado': return { bg: '#87c540', text: 'white' };
      default: return { bg: '#999', text: 'white' };
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'en_espera': return 'En espera';
      case 'en_preparacion': return 'En preparación';
      case 'terminado': return 'Terminado';
      default: return estado;
    }
  };

  const abrirModalPago = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalPagoAbierto(true);
  };

  const cerrarModalPago = () => {
    setModalPagoAbierto(false);
    setPedidoSeleccionado(null);
  };

  const pagarConMetodo = (metodo) => {
    if (!numeroMesa) return;

    const totalGeneral = calcularTotalGeneral();
    const numPedidos = pedidos.length;

    // Enviar notificación al camarero
    socket.emit("mensajeCliente", {
      numeroMesa,
      mensaje: `💳 Solicitud de pago con ${metodo} - ${numPedidos} pedido(s) - Total: ${totalGeneral}€`,
      remitente: "cliente"
    });

    alert(`Pago con ${metodo} realizado. Gracias por su visita.`);
    cerrarModalPago();
    
    // Cerrar sesión después del pago
    cerrarSesionCliente();
  };

  const solicitarTicket = () => {
    if (!numeroMesa) return;

    const totalGeneral = calcularTotalGeneral();
    const numPedidos = pedidos.length;

    // Enviar mensaje al camarero solicitando el ticket
    socket.emit("mensajeCliente", {
      numeroMesa,
      mensaje: `🧾 Solicitud de ticket físico - ${numPedidos} pedido(s) - Total: ${totalGeneral}€`,
      remitente: "cliente"
    });

    alert("Solicitud de ticket enviada. Gracias por su visita.");
    cerrarModalPago();
    
    // Cerrar sesión después de solicitar ticket
    cerrarSesionCliente();
  };

  const cerrarSesionCliente = () => {
    // Limpiar localStorage
    localStorage.removeItem('clientSessionId');
    localStorage.removeItem('numeroMesa');
    localStorage.removeItem('carrito');
    localStorage.removeItem('historialPedidos');
    
    // Limpiar chats
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chat_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Redirigir a la página de inicio
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const calcularTotalGeneral = () => {
    return pedidos.reduce((total, pedido) => {
      return total + parseFloat(calcularTotalPedido(pedido.items));
    }, 0).toFixed(2);
  };

  return (
    <div class="client-orders-container">
      {pedidos.length === 0 ? (
        <div class="empty-orders-message">
          <i class="fa-solid fa-receipt" style="font-size: 5rem; color: #ccc; margin-bottom: 20px;"></i>
          <h2 style="color: #666; font-size: 1.5rem; text-align: center;">No hay pedidos</h2>
          <p style="color: #999; text-align: center; margin-top: 10px;">Tus pedidos aparecerán aquí</p>
        </div>
      ) : (
        <>
          <div class="orders-list">
            {pedidos.map((pedido) => (
              <div class="order-card" key={pedido.id}>
                <div class="order-header">
                  <h2 class="order-title">Mesa {pedido.numeroMesa || numeroMesa} - Pedido #{pedido.id.substring(0, 8)}</h2>
                  <span 
                    class="order-status-badge" 
                    style={{ 
                      backgroundColor: getEstadoColor(pedido.estado).bg,
                      color: getEstadoColor(pedido.estado).text
                    }}
                  >
                    {getEstadoTexto(pedido.estado)}
                  </span>
                </div>
                
                <div class="order-items">
                  <table class="order-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td>{item.nombre}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.precio}€</td>
                          <td>{(item.precio * item.cantidad).toFixed(2)}€</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div class="order-total">
                  <strong>Total: {calcularTotalPedido(pedido.items)}€</strong>
                </div>
                
                <div class="order-footer">
                  <small class="order-time">
                    {new Date(pedido.fecha).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div class="historial-total-section">
            <div class="historial-total-info">
              <span class="total-label">Total de todos los pedidos:</span>
              <span class="total-amount">{calcularTotalGeneral()}€</span>
            </div>
            <button 
              class="btn-pagar-total"
              onClick={() => abrirModalPago(null)}
            >
              <i class="fa-solid fa-credit-card"></i> Pagar Cuenta
            </button>
          </div>
        </>
      )}

      {modalPagoAbierto && (
        <div class="modal-pago-overlay" onClick={cerrarModalPago}>
          <div class="modal-pago-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-pago-header">
              <h3>
                <i class="fa-solid fa-credit-card"></i>
                Opciones de Pago
              </h3>
              <button class="modal-close-btn" onClick={cerrarModalPago}>
                <i class="fa-solid fa-times"></i>
              </button>
            </div>

            <div class="modal-pago-info">
              <p><strong>Mesa:</strong> {numeroMesa}</p>
              <p><strong>Número de pedidos:</strong> {pedidos.length}</p>
              <p class="modal-total"><strong>Total a pagar:</strong> {calcularTotalGeneral()}€</p>
            </div>

            <div class="modal-pago-opciones">
              <button class="opcion-pago tarjeta" onClick={() => pagarConMetodo("Tarjeta")}>
                <i class="fa-solid fa-credit-card"></i>
                <span>Tarjeta</span>
              </button>
              <button class="opcion-pago efectivo" onClick={() => pagarConMetodo("Efectivo")}>
                <i class="fa-solid fa-money-bill-wave"></i>
                <span>Efectivo</span>
              </button>
              <button class="opcion-pago bizum" onClick={() => pagarConMetodo("Bizum")}>
                <i class="fa-solid fa-mobile-screen"></i>
                <span>Bizum</span>
              </button>
              <button class="opcion-pago paypal" onClick={() => pagarConMetodo("PayPal")}>
                <i class="fa-brands fa-paypal"></i>
                <span>PayPal</span>
              </button>
              <button class="opcion-pago googlepay" onClick={() => pagarConMetodo("Google Pay")}>
                <i class="fa-brands fa-google-pay"></i>
                <span>Google Pay</span>
              </button>
              <button class="opcion-pago applepay" onClick={() => pagarConMetodo("Apple Pay")}>
                <i class="fa-brands fa-apple-pay"></i>
                <span>Apple Pay</span>
              </button>
            </div>

            <div class="modal-pago-divider">
              <span>o</span>
            </div>

            <button class="btn-solicitar-ticket" onClick={solicitarTicket}>
              <i class="fa-solid fa-receipt"></i>
              Solicitar Ticket Físico
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
