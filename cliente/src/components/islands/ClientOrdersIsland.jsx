import { useEffect, useState } from "preact/hooks";
import { socket, obtenerNumeroMesa } from "../../lib/socket";
import { historial } from "../../lib/historial";

export default function ClientOrdersIsland() {
  const [pedidos, setPedidos] = useState([]);
  const [numeroMesa, setNumeroMesa] = useState(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [tipoPago, setTipoPago] = useState(null);
  const [pantallaPagoAbierta, setPantallaPagoAbierta] = useState(false);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    const mesa = obtenerNumeroMesa();
    if (mesa) {
      setNumeroMesa(mesa);
    }

    const handleAsignarMesa = ({ numeroMesa: mesa }) => {
      setNumeroMesa(mesa);
    };

    socket.on("asignarMesa", handleAsignarMesa);

    socket.on("estadoPedido", (pedido) => {
      historial.actualizarPedido(pedido);
      setPedidos([...historial.obtenerHistorial()]);
    });

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

    // Abrir pantalla de pago específica
    setMetodoPagoSeleccionado(metodo);
    cerrarModalPago();
    setPantallaPagoAbierta(true);
  };

  /**
   * Envía solicitud de pago al camarero con el método seleccionado
   */
  const confirmarPago = () => {
    setProcesandoPago(true);

    const totalGeneral = calcularTotalGeneral();
    const numPedidos = pedidos.length;

    socket.emit("mensajeCliente", {
      numeroMesa,
      mensaje: `💳 Solicitud de pago con ${metodoPagoSeleccionado} - ${numPedidos} pedido(s) - Total: ${totalGeneral}€`,
      remitente: "cliente"
    });

    setTimeout(() => {
      setProcesandoPago(false);
      setPantallaPagoAbierta(false);
      setTipoPago(metodoPagoSeleccionado);
      setModalConfirmacionAbierto(true);
    }, 2000);
  };

  const cerrarPantallaPago = () => {
    setPantallaPagoAbierta(false);
    setMetodoPagoSeleccionado(null);
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

    // Guardar tipo como ticket y abrir modal de confirmación
    setTipoPago("ticket");
    cerrarModalPago();
    setModalConfirmacionAbierto(true);
  };

  const cerrarSesionCliente = () => {
    localStorage.removeItem('clientSessionId');
    localStorage.removeItem('numeroMesa');
    localStorage.removeItem('carrito');
    localStorage.removeItem('historialPedidos');
    localStorage.removeItem('comensales');
    localStorage.removeItem('ultimoPedidoTime');
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chat_')) {
        localStorage.removeItem(key);
      }
    });
    
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  /**
   * Calcula el total general incluyendo pedidos y precio del buffet
   */
  const calcularTotalGeneral = () => {
    const pedidoTotal = pedidos.reduce((total, pedido) => {
      return total + parseFloat(calcularTotalPedido(pedido.items));
    }, 0);
    
    const comensalesData = localStorage.getItem('comensales');
    const precioBuffet = comensalesData 
      ? parseFloat(JSON.parse(comensalesData).precioBuffet || 0)
      : 0;
    
    return (pedidoTotal + precioBuffet).toFixed(2);
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
              
              {(() => {
                const comensalesData = localStorage.getItem('comensales');
                const precioBuffet = comensalesData 
                  ? parseFloat(JSON.parse(comensalesData).precioBuffet || 0)
                  : 0;
                const pedidoTotal = pedidos.reduce((total, pedido) => {
                  return total + parseFloat(calcularTotalPedido(pedido.items));
                }, 0);
                
                const comensales = comensalesData ? JSON.parse(comensalesData) : null;
                
                return (
                  <>
                    {comensales && precioBuffet > 0 && (
                      <div class="modal-desglose">
                        <p>
                          <i class="fa-solid fa-utensils"></i>
                          <span>Buffet ({comensales.adultos} adultos + {comensales.ninos} niños):</span>
                          <strong>{precioBuffet.toFixed(2)}€</strong>
                        </p>
                      </div>
                    )}
                    {pedidoTotal > 0 && (
                      <div class="modal-desglose">
                        <p>
                          <i class="fa-solid fa-plate-wheat"></i>
                          <span>Productos especiales:</span>
                          <strong>{pedidoTotal.toFixed(2)}€</strong>
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
              
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

      {pantallaPagoAbierta && metodoPagoSeleccionado && (
        <div class="modal-pago-overlay">
          <div class="modal-pago-content pantalla-pago">
            <div class="modal-pago-header">
              <h3>
                {metodoPagoSeleccionado === "Tarjeta" && <i class="fa-solid fa-credit-card"></i>}
                {metodoPagoSeleccionado === "Efectivo" && <i class="fa-solid fa-money-bill-wave"></i>}
                {metodoPagoSeleccionado === "Bizum" && <i class="fa-solid fa-mobile-screen"></i>}
                {metodoPagoSeleccionado === "PayPal" && <i class="fa-brands fa-paypal"></i>}
                {metodoPagoSeleccionado === "Google Pay" && <i class="fa-brands fa-google-pay"></i>}
                {metodoPagoSeleccionado === "Apple Pay" && <i class="fa-brands fa-apple-pay"></i>}
                Pagar con {metodoPagoSeleccionado}
              </h3>
              {!procesandoPago && (
                <button class="modal-close-btn" onClick={cerrarPantallaPago}>
                  <i class="fa-solid fa-times"></i>
                </button>
              )}
            </div>

            <div class="pantalla-pago-body">
              <div class="pago-total-display">
                <span class="pago-total-label">Total a pagar</span>
                <span class="pago-total-amount">{calcularTotalGeneral()}€</span>
              </div>

              {metodoPagoSeleccionado === "Tarjeta" && (
                <div class="formulario-pago">
                  <div class="input-group">
                    <label>Número de tarjeta</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456" 
                      maxLength="19"
                      disabled={procesandoPago}
                    />
                  </div>
                  <div class="input-row">
                    <div class="input-group">
                      <label>Fecha de expiración</label>
                      <input 
                        type="text" 
                        placeholder="MM/AA" 
                        maxLength="5"
                        disabled={procesandoPago}
                      />
                    </div>
                    <div class="input-group">
                      <label>CVV</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        maxLength="3"
                        disabled={procesandoPago}
                      />
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Nombre del titular</label>
                    <input 
                      type="text" 
                      placeholder="NOMBRE APELLIDOS" 
                      disabled={procesandoPago}
                    />
                  </div>
                </div>
              )}

              {metodoPagoSeleccionado === "Efectivo" && (
                <div class="mensaje-efectivo">
                  <i class="fa-solid fa-info-circle"></i>
                  <p>Por favor, prepare el importe exacto o indique al camarero si necesita cambio.</p>
                  <div class="efectivo-importe">
                    <strong>{calcularTotalGeneral()}€</strong>
                  </div>
                </div>
              )}

              {metodoPagoSeleccionado === "Bizum" && (
                <div class="formulario-pago">
                  <div class="bizum-info">
                    <i class="fa-solid fa-mobile-screen" style="font-size: 4rem; color: #00A9E0;"></i>
                    <p>Introduce tu número de teléfono</p>
                  </div>
                  <div class="input-group">
                    <label>Teléfono</label>
                    <input 
                      type="tel" 
                      placeholder="612 345 678" 
                      maxLength="11"
                      disabled={procesandoPago}
                    />
                  </div>
                  <div class="input-group">
                    <label>Código de verificación</label>
                    <input 
                      type="text" 
                      placeholder="123456" 
                      maxLength="6"
                      disabled={procesandoPago}
                    />
                  </div>
                </div>
              )}

              {metodoPagoSeleccionado === "PayPal" && (
                <div class="formulario-pago">
                  <div class="paypal-logo">
                    <i class="fa-brands fa-paypal" style="font-size: 5rem; color: #0070BA;"></i>
                  </div>
                  <div class="input-group">
                    <label>Correo electrónico de PayPal</label>
                    <input 
                      type="email" 
                      placeholder="correo@ejemplo.com" 
                      disabled={procesandoPago}
                    />
                  </div>
                  <div class="input-group">
                    <label>Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      disabled={procesandoPago}
                    />
                  </div>
                </div>
              )}

              {metodoPagoSeleccionado === "Google Pay" && (
                <div class="pago-digital">
                  <i class="fa-brands fa-google-pay" style="font-size: 6rem; color: #4285F4;"></i>
                  <p>Confirma el pago en tu dispositivo</p>
                  <div class="dispositivo-info">
                    <i class="fa-solid fa-mobile-screen"></i>
                    <span>Verifica tu identidad en tu teléfono</span>
                  </div>
                </div>
              )}

              {metodoPagoSeleccionado === "Apple Pay" && (
                <div class="pago-digital">
                  <i class="fa-brands fa-apple-pay" style="font-size: 6rem; color: #A6B1B7;"></i>
                  <p>Confirma el pago con Face ID o Touch ID</p>
                  <div class="dispositivo-info">
                    <i class="fa-solid fa-fingerprint"></i>
                    <span>Usa tu dispositivo Apple para confirmar</span>
                  </div>
                </div>
              )}

              <button 
                class="btn-confirmar-pago"
                onClick={confirmarPago}
                disabled={procesandoPago}
              >
                {procesandoPago ? (
                  <>
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i class="fa-solid fa-lock"></i>
                    Confirmar Pago
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmacionAbierto && (
        <div class="modal-confirmacion-overlay">
          <div class="modal-confirmacion-content">
            <button class="modal-confirmacion-close" onClick={cerrarSesionCliente}>
              <i class="fa-solid fa-times"></i>
            </button>

            <div class="modal-confirmacion-icon">
              {tipoPago === "ticket" ? (
                <i class="fa-solid fa-hourglass-half"></i>
              ) : (
                <i class="fa-solid fa-circle-check"></i>
              )}
            </div>
            
            <h2 class="modal-confirmacion-title">
              {tipoPago === "ticket" 
                ? "Esperando al camarero" 
                : `Pago con ${tipoPago} confirmado`}
            </h2>
            
            <p class="modal-confirmacion-mensaje">
              {tipoPago === "ticket" 
                ? "No cierre esta ventana. El camarero llegará en breve con su ticket." 
                : "No cierre esta ventana. El camarero llegará en breve para finalizar el pago."}
            </p>
            
            <div class="modal-confirmacion-info">
              <i class="fa-solid fa-info-circle"></i>
              <span>Por favor, permanezca en su mesa</span>
            </div>

            <button class="btn-cerrar-sesion" onClick={cerrarSesionCliente}>
              <i class="fa-solid fa-door-open"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
