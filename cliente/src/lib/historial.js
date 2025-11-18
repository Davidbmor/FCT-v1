export class HistorialPedidos {
  constructor() {
    this.pedidos = [];
  }

  actualizarPedido(pedidoActualizado) {
    const i = this.pedidos.findIndex(p => p.id === pedidoActualizado.id);
    if (i !== -1) this.pedidos[i] = pedidoActualizado;
    else this.pedidos.push(pedidoActualizado);
  }

  obtenerHistorial() {
    return this.pedidos;
  }
}

export const historial = new HistorialPedidos();
