import { socket } from "../../lib/socket";

export default function TicketStatusIsland({ id, estado }) {
  function cambiar(e) {
    const nuevoEstado = e.target.value;
    socket.emit("actualizarEstado", { id, nuevoEstado });
  }

  return (
    <select class="estado-selector" onChange={cambiar} value={estado}>
      <option value="wait" data-color="#e31f26">En espera</option>
      <option value="prep" data-color="#f8ed43">En preparación</option>
      <option value="end" data-color="#87c540">Terminado</option>
    </select>
  );
}
