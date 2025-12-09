import { io } from "socket.io-client";

const esEmpleado = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    return path.includes('gestorTickets') || path.includes('gestorCarta');
  }
  return false;
};

/**
 * Genera o recupera un ID de sesión único para identificar al cliente
 * Persiste en localStorage para mantener la sesión entre recargas
 */
const getClientSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('clientSessionId');
  if (!sessionId) {
    sessionId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('clientSessionId', sessionId);
  }
  return sessionId;
};

export const socket = io("http://localhost:3000", {
  auth: {
    esEmpleado: esEmpleado(),
    sessionId: getClientSessionId()
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
});

let numeroMesa = null;

if (typeof window !== 'undefined' && !esEmpleado()) {
  const mesaGuardada = localStorage.getItem('numeroMesa');
  if (mesaGuardada) {
    numeroMesa = parseInt(mesaGuardada);
    console.log(`🪑 Mesa restaurada desde localStorage: ${numeroMesa}`);
  }
}

socket.on("asignarMesa", ({ numeroMesa: mesa }) => {
  numeroMesa = mesa;
  if (typeof window !== 'undefined') {
    localStorage.setItem('numeroMesa', mesa.toString());
  }
  console.log(`🪑 Mesa asignada: ${mesa}`);
});

socket.on("reconnect", () => {
  console.log("🔄 Reconectado al servidor");
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Desconectado del servidor:", reason);
});

/**
 * Cierra la sesión del cliente limpiando todo el estado local
 * y forzando la reasignación de mesa en la próxima conexión
 */
export const cerrarSesionCliente = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('clientSessionId');
  localStorage.removeItem('numeroMesa');
  localStorage.removeItem('carrito');
  localStorage.removeItem('historialPedidos');
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('chat_')) {
      localStorage.removeItem(key);
    }
  });
  
  window.location.reload();
};

export const obtenerNumeroMesa = () => numeroMesa;
export { esEmpleado };
