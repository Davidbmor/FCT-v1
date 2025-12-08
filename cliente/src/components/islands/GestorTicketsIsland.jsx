// src/components/islands/GestorTicketsIsland.jsx
import { useEffect, useState } from "preact/hooks";
import { socket } from "../../lib/socket";
import TicketStatusIsland from "../islands/TicketStatusIsland.jsx"; 

export default function GestorTicketsIsland() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosEliminados, setPedidosEliminados] = useState(new Set());

  useEffect(() => {
    socket.emit("obtenerPedidos");

    const handleListaPedidos = (lista) => {
      if (!Array.isArray(lista)) return;
      // Filtrar los pedidos que ya fueron eliminados localmente
      const pedidosFiltrados = lista.filter(p => !pedidosEliminados.has(p.id));
      setPedidos(pedidosFiltrados);
    };

    socket.on("listaPedidos", handleListaPedidos);

    return () => {
      socket.off("listaPedidos", handleListaPedidos);
    };
  }, [pedidosEliminados]);

  function cambiarEstado(id, nuevoEstado) {
    socket.emit("actualizarEstado", { id, nuevoEstado });
  }

  function eliminarPedido(id) {
    socket.emit("eliminarPedido", { id });
    // Marcar el pedido como eliminado localmente
    setPedidosEliminados((prev) => new Set([...prev, id]));
    setPedidos((prev) => prev.filter((p) => p.id !== id));
  }

  const calcularTotal = (items) => {
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

  return (
    <section class="ticket-container">
      {pedidos.length === 0 ? (
        <div class="no-pedidos-message">
          <i class="fa-solid fa-clipboard-list" style="font-size: 4rem; color: #ccc; margin-bottom: 15px;"></i>
          <p style="font-size: 1.2rem; color: #666;">No hay pedidos en este momento</p>
        </div>
      ) : (
        pedidos.map((pedido) => (
          <div class="ticket" key={pedido.id}>
            <div class="ticket-header">
              <div class="ticket-number">
                <h2>Mesa {pedido.numeroMesa}</h2>
                <span 
                  class="ticket-badge"
                  style={{
                    backgroundColor: getEstadoColor(pedido.estado).bg,
                    color: getEstadoColor(pedido.estado).text
                  }}
                >
                  {pedido.estado === 'en_espera' ? 'En espera' : 
                   pedido.estado === 'en_preparacion' ? 'En preparación' : 'Terminado'}
                </span>
              </div>
              {pedido.estado === 'terminado' && (
                <button 
                  class="delete-ticket-btn"
                  onClick={() => eliminarPedido(pedido.id)}
                  title="Eliminar pedido"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              )}
            </div>

            <div class="ticket-items">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedido.items || []).map((it, idx) => (
                    <tr key={it.id ?? idx}>
                      <td class="item-name">{it.nombre}</td>
                      <td class="item-qty">{it.cantidad}</td>
                      <td class="item-price">{it.precio}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div class="ticket-total">
              <strong>Total: {calcularTotal(pedido.items)}€</strong>
            </div>

            <div class="ticket-status">
              <TicketStatusIsland
                id={pedido.id}
                estado={pedido.estado}
                onChangeEstado={cambiarEstado}
              />
            </div>

            <div class="ticket-time">
              <small style="color: #999;">
                {new Date(pedido.fecha).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
