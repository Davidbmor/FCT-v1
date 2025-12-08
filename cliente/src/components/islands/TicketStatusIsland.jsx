import { socket } from "../../lib/socket";

export default function TicketStatusIsland({ id, estado }) {
  function cambiar(e) {
    const nuevoEstado = e.target.value;
    socket.emit("actualizarEstado", { id, nuevoEstado });
  }

  return (
    <select class="estado-selector" onChange={cambiar} value={estado}>
      <option value="en_espera" data-color="#FF781E">En espera</option>
      <option value="en_preparacion" data-color="#FFE11F">En preparación</option>
      <option value="terminado" data-color="#87c540">Terminado</option>
    </select>
  );
}
