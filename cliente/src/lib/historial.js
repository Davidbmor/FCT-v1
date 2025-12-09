export class HistorialPedidos {
  constructor() {
    this.pedidos = [];
    this.cargarDesdeLocalStorage();
  }

  cargarDesdeLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const historialGuardado = localStorage.getItem('historialPedidos');
        if (historialGuardado) {
          this.pedidos = JSON.parse(historialGuardado);
          console.log(`📋 Historial restaurado: ${this.pedidos.length} pedidos`);
        }
      } catch (error) {
        console.error('Error al cargar historial:', error);
        this.pedidos = [];
      }
    }
  }

  guardarEnLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('historialPedidos', JSON.stringify(this.pedidos));
      } catch (error) {
        console.error('Error al guardar historial:', error);
      }
    }
  }

  /**
   * Actualiza un pedido existente o agrega uno nuevo
   * Preserva la fecha original si el pedido ya existe
   */
  actualizarPedido(pedidoActualizado) {
    const i = this.pedidos.findIndex(p => p.id === pedidoActualizado.id);
    if (i !== -1) {
      this.pedidos[i] = { ...pedidoActualizado, fecha: this.pedidos[i].fecha };
    } else {
      this.pedidos.push({ ...pedidoActualizado, fecha: new Date() });
    }
    this.guardarEnLocalStorage();
  }

  obtenerHistorial() {
    return this.pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  limpiarHistorial() {
    this.pedidos = [];
    this.guardarEnLocalStorage();
  }
}

export const historial = new HistorialPedidos();
