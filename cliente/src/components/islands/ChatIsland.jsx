import { useEffect, useState, useRef } from "preact/hooks";
import { socket, obtenerNumeroMesa } from "../../lib/socket";

export default function ChatIsland() {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [numeroMesa, setNumeroMesa] = useState(null);
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    const mesa = obtenerNumeroMesa();
    setNumeroMesa(mesa);

    const handleAsignarMesa = ({ numeroMesa: mesa }) => {
      setNumeroMesa(mesa);
    };

    socket.on("asignarMesa", handleAsignarMesa);

    const mensajesGuardados = localStorage.getItem(`chat_mesa_${mesa}`);
    if (mensajesGuardados) {
      setMensajes(JSON.parse(mensajesGuardados));
    }

    const handleNuevoMensaje = (mensaje) => {
      setMensajes((prev) => {
        const nuevos = [...prev, mensaje];
        localStorage.setItem(`chat_mesa_${numeroMesa || mesa}`, JSON.stringify(nuevos));
        return nuevos;
      });
    };

    socket.on("nuevoMensajeChat", handleNuevoMensaje);

    return () => {
      socket.off("asignarMesa", handleAsignarMesa);
      socket.off("nuevoMensajeChat", handleNuevoMensaje);
    };
  }, [numeroMesa]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return;

    const mensaje = {
      texto: nuevoMensaje,
      numeroMesa: numeroMesa,
      remitente: "cliente",
      timestamp: new Date().toISOString()
    };

    socket.emit("enviarMensajeChat", mensaje);
    
    setMensajes((prev) => {
      const nuevos = [...prev, mensaje];
      localStorage.setItem(`chat_mesa_${numeroMesa}`, JSON.stringify(nuevos));
      return nuevos;
    });
    
    setNuevoMensaje("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const mensajesRapidos = [
    { icono: "fa-napkin", texto: "Servilletas, por favor" },
    { icono: "fa-utensils", texto: "Recoger platos" },
    { icono: "fa-water", texto: "Más agua, por favor" },
    { icono: "fa-receipt", texto: "Traer la cuenta" },
    { icono: "fa-hand", texto: "Necesito ayuda" }
  ];

  const enviarMensajeRapido = (texto) => {
    const mensaje = {
      texto: texto,
      numeroMesa: numeroMesa,
      remitente: "cliente",
      timestamp: new Date().toISOString()
    };

    socket.emit("enviarMensajeChat", mensaje);
    
    setMensajes((prev) => {
      const nuevos = [...prev, mensaje];
      localStorage.setItem(`chat_mesa_${numeroMesa}`, JSON.stringify(nuevos));
      return nuevos;
    });
  };

  return (
    <div class="chat-content">
      <div class="mensajes-rapidos">
        <div class="mensajes-rapidos-titulo">
          <i class="fa-solid fa-bolt"></i>
          <span>Mensajes Rápidos</span>
        </div>
        <div class="mensajes-rapidos-lista">
          {mensajesRapidos.map((msg, idx) => (
            <button
              key={idx}
              class="mensaje-rapido-btn"
              onClick={() => enviarMensajeRapido(msg.texto)}
              title={msg.texto}
            >
              <i class={`fa-solid ${msg.icono}`}></i>
              <span>{msg.texto}</span>
            </button>
          ))}
        </div>
      </div>
      <div class="chat-messages">
        {mensajes.length === 0 ? (
          <div class="empty-chat">
            <i class="fa-solid fa-comments" style="font-size: 4rem; color: #ccc; margin-bottom: 15px;"></i>
            <p style="color: #999; text-align: center;">No hay mensajes aún</p>
            <p style="color: #bbb; text-align: center; font-size: 0.9rem; margin-top: 8px;">
              Envía un mensaje al camarero
            </p>
          </div>
        ) : (
          mensajes.map((msg, idx) => (
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
          ))
        )}
        <div ref={mensajesEndRef} />
      </div>

      <div class="chat-input">
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
    </div>
  );
}
