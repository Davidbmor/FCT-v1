export class Carrito {
  constructor() {
    this.items = {};
  }

  agregarProducto(producto) {
    if (!this.items[producto.id]) {
      this.items[producto.id] = { ...producto, cantidad: 1 };
    } else {
      this.items[producto.id].cantidad++;
    }
  }

  eliminarProducto(id) {
    if (this.items[id]) {
      this.items[id].cantidad--;
      if (this.items[id].cantidad <= 0) delete this.items[id];
    }
  }

  vaciar() {
    this.items = {};
  }

  obtenerLista() {
    return Object.values(this.items);
  }

  total() {
    return this.obtenerLista().reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }
}
