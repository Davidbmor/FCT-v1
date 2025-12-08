export class Carrito {
  constructor() {
    this.items = {};
    this.cargarDesdeLocalStorage();
  }

  cargarDesdeLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
          this.items = JSON.parse(carritoGuardado);
          console.log(`🛒 Carrito restaurado: ${Object.keys(this.items).length} productos`);
        }
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        this.items = {};
      }
    }
  }

  guardarEnLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('carrito', JSON.stringify(this.items));
      } catch (error) {
        console.error('Error al guardar carrito:', error);
      }
    }
  }

  agregarProducto(producto) {
    if (!this.items[producto.id]) {
      this.items[producto.id] = { ...producto, cantidad: 1 };
    } else {
      this.items[producto.id].cantidad++;
    }
    this.guardarEnLocalStorage();
  }

  eliminarProducto(id) {
    if (this.items[id]) {
      this.items[id].cantidad--;
      if (this.items[id].cantidad <= 0) delete this.items[id];
    }
    this.guardarEnLocalStorage();
  }

  obtenerLista() {
    return Object.values(this.items);
  }

  vaciar() {
    this.items = {};
    this.guardarEnLocalStorage();
  }

  total() {
    return this.obtenerLista()
      .reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }

  cantidadTotal() {
    return this.obtenerLista()
      .reduce((sum, item) => sum + item.cantidad, 0);
  }
}

export const carritoGlobal = new Carrito();
