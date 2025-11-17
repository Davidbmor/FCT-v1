export class HistorialPedidos {
  constructor() {
    this.pedidos = [];
  }
  agregarPedido(pedido) {
    this.pedidos.push(pedido);
  }
  actualizarPedido(pedidoActualizado) {
    const index = this.pedidos.findIndex(p => p.id === pedidoActualizado.id);
    if (index !== -1) this.pedidos[index] = pedidoActualizado;
    else this.pedidos.push(pedidoActualizado);
  }
  obtenerHistorial() {
    return this.pedidos;
  }
}