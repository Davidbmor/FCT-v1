import { useEffect, useState, useRef } from "preact/hooks";
import { socket } from "../../lib/socket";

export default function ChatCamareroIsland() {
  const [mensajesPorMesa, setMensajesPorMesa] = useState({});
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    // Cargar mensajes desde localStorage
    const mensajesGuardados = localStorage.getItem('chat_camarero');
    if (mensajesGuardados) {
      setMensajesPorMesa(JSON.parse(mensajesGuardados));
    }

    // Escuchar mensajes nuevos (solo del cliente)
    const handleNuevoMensaje = (mensaje) => {
      // Solo agregar mensajes del cliente, no los propios del camarero
      if (mensaje.remitente !== 'camarero') {
        setMensajesPorMesa((prev) => {
          const mesaKey = mensaje.numeroMesa;
          const mensajesMesa = prev[mesaKey] || [];
          const nuevos = {
            ...prev,
            [mesaKey]: [...mensajesMesa, mensaje]
          };
          localStorage.setItem('chat_camarero', JSON.stringify(nuevos));
          return nuevos;
        });

        // Auto-seleccionar la mesa si hay un mensaje nuevo
        if (!mesaSeleccionada) {
          setMesaSeleccionada(mensaje.numeroMesa);
        }
      }
    };

    socket.on("nuevoMensajeChat", handleNuevoMensaje);

    return () => {
      socket.off("nuevoMensajeChat", handleNuevoMensaje);
    };
  }, [mesaSeleccionada]);

  useEffect(() => {
    // Scroll automático al último mensaje
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajesPorMesa, mesaSeleccionada]);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !mesaSeleccionada) return;

    const mensaje = {
      texto: nuevoMensaje,
      numeroMesa: mesaSeleccionada,
      remitente: "camarero",
      timestamp: new Date().toISOString()
    };

    // Agregar inmediatamente al estado local
    setMensajesPorMesa((prev) => {
      const mensajesMesa = prev[mesaSeleccionada] || [];
      const nuevos = {
        ...prev,
        [mesaSeleccionada]: [...mensajesMesa, mensaje]
      };
      localStorage.setItem('chat_camarero', JSON.stringify(nuevos));
      return nuevos;
    });

    // Enviar al servidor (pero no volver a agregar cuando llegue el evento)
    socket.emit("enviarMensajeChat", mensaje);
    
    setNuevoMensaje("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const mesasConMensajes = Object.keys(mensajesPorMesa).sort((a, b) => a - b);
  const mensajesActuales = mesaSeleccionada ? (mensajesPorMesa[mesaSeleccionada] || []) : [];

  const contarMensajesNoLeidos = (mesa) => {
    const mensajes = mensajesPorMesa[mesa] || [];
    return mensajes.filter(m => m.remitente === 'cliente' && !m.leido).length;
  };

  const contarTotalNoLeidos = () => {
    let total = 0;
    Object.keys(mensajesPorMesa).forEach(mesa => {
      total += contarMensajesNoLeidos(mesa);
    });
    return total;
  };

  const marcarMesaComoLeida = (mesa) => {
    setMensajesPorMesa((prev) => {
      const mensajesMesa = prev[mesa] || [];
      const mensajesActualizados = mensajesMesa.map(m => ({
        ...m,
        leido: m.remitente === 'cliente' ? true : m.leido
      }));
      
      const nuevos = {
        ...prev,
        [mesa]: mensajesActualizados
      };
      
      localStorage.setItem('chat_camarero', JSON.stringify(nuevos));
      return nuevos;
    });
  };

  // Actualizar badge del botón flotante
  useEffect(() => {
    const totalNoLeidos = contarTotalNoLeidos();
    const badge = document.getElementById('badgeChatTotal');
    if (badge) {
      badge.textContent = totalNoLeidos;
      badge.style.display = totalNoLeidos > 0 ? 'flex' : 'none';
    }
  }, [mensajesPorMesa]);

  return (
    <div class="chat-camarero-container">
      <div class="chat-sidebar">
        <h3>Conversaciones</h3>
        {mesasConMensajes.length === 0 ? (
          <div class="no-conversations">
            <p>No hay conversaciones</p>
          </div>
        ) : (
          <div class="mesas-list">
            {mesasConMensajes.map((mesa) => {
              const ultimoMensaje = mensajesPorMesa[mesa][mensajesPorMesa[mesa].length - 1];
              const noLeidos = contarMensajesNoLeidos(mesa);
              
              return (
                <div
                  key={mesa}
                  class={`mesa-item ${mesaSeleccionada == mesa ? 'selected' : ''}`}
                  onClick={() => {
                    setMesaSeleccionada(mesa);
                    marcarMesaComoLeida(mesa);
                  }}
                >
                  <div class="mesa-info">
                    <div class="mesa-header">
                      <span class="mesa-numero">Mesa {mesa}</span>
                      {noLeidos > 0 && (
                        <span class="badge-noLeidos">{noLeidos}</span>
                      )}
                    </div>
                    <div class="ultimo-mensaje">
                      {ultimoMensaje.texto.substring(0, 30)}
                      {ultimoMensaje.texto.length > 30 ? '...' : ''}
                    </div>
                    <div class="mensaje-hora">
                      {new Date(ultimoMensaje.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div class="chat-main">
        {!mesaSeleccionada ? (
          <div class="no-mesa-selected">
            <i class="fa-solid fa-comments" style="font-size: 4rem; color: #ccc; margin-bottom: 15px;"></i>
            <p style="color: #999;">Selecciona una mesa para ver la conversación</p>
          </div>
        ) : (
          <>
            <div class="chat-header-camarero">
              <h3>Mesa {mesaSeleccionada}</h3>
            </div>
            
            <div class="chat-messages-camarero">
              {mensajesActuales.map((msg, idx) => (
                <div 
                  key={idx} 
                  class={`mensaje ${msg.remitente === 'cliente' ? 'mensaje-cliente' : 'mensaje-camarero'}`}
                >
                  <div class="mensaje-header">
                    <span class="mensaje-autor">
                      {msg.remitente === 'cliente' ? `Mesa ${msg.numeroMesa}` : 'Camarero'}
                    </span>
                    <span class="mensaje-hora">
                      {new Date(msg.timestamp).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div class="mensaje-texto">{msg.texto}</div>
                </div>
              ))}
              <div ref={mensajesEndRef} />
            </div>

            <div class="chat-input-camarero">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onInput={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={500}
              />
              <button onClick={enviarMensaje} disabled={!nuevoMensaje.trim()}>
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
