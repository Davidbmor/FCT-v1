import { Connection } from "mysql2/promise";

export interface Producto {
  id?: number;
  nombre: string;
  tipo: string;
  cantidad: number;
  descripcion: string;
  url_imagen: string;
  precio: number;
  disponible: boolean;
  alergenos?: Alergeno[];
}

export interface Alergeno {
  id: number;
  nombre: string;
  svg: string;
}

export class ProductoModel {
  private db: Connection;

  constructor(db: Connection) {
    this.db = db;
  }

  async obtenerTodos(): Promise<Producto[]> {
    const [productos] = await this.db.query(`
      SELECT 
        p.id,
        p.nombre,
        p.tipo,
        p.cantidad,
        p.descripcion,
        p.url_imagen,
        p.precio,
        p.disponible
      FROM productos p
    `);

    const [alergenos] = await this.db.query(`
      SELECT 
        pa.producto_id,
        a.id,
        a.nombre,
        a.svg
      FROM producto_alergeno pa
      JOIN alergenos a ON a.id = pa.alergeno_id
    `);

    return (productos as any[]).map((p) => ({
      ...p,
      alergenos: (alergenos as any[])
        .filter((a) => a.producto_id === p.id)
        .map((a) => ({ id: a.id, nombre: a.nombre, svg: a.svg })),
    }));
  }

  async obtenerDisponibles(): Promise<Producto[]> {
    const [productos] = await this.db.query(`
      SELECT 
        p.id,
        p.nombre,
        p.tipo,
        p.cantidad,
        p.descripcion,
        p.url_imagen,
        p.precio,
        p.disponible
      FROM productos p
      WHERE p.disponible = true
    `);

    const [alergenos] = await this.db.query(`
      SELECT 
        pa.producto_id,
        a.id,
        a.nombre,
        a.svg
      FROM producto_alergeno pa
      JOIN alergenos a ON a.id = pa.alergeno_id
    `);

    return (productos as any[]).map((p) => ({
      ...p,
      alergenos: (alergenos as any[])
        .filter((a) => a.producto_id === p.id)
        .map((a) => ({ id: a.id, nombre: a.nombre, svg: a.svg })),
    }));
  }

  async obtenerPorId(id: number): Promise<Producto | null> {
    const [productos] = await this.db.query(
      `SELECT * FROM productos WHERE id = ?`,
      [id]
    );

    if ((productos as any[]).length === 0) return null;

    const producto = (productos as any[])[0];

    const [alergenos] = await this.db.query(`
      SELECT a.id, a.nombre, a.svg
      FROM producto_alergeno pa
      JOIN alergenos a ON a.id = pa.alergeno_id
      WHERE pa.producto_id = ?
    `, [id]);

    return {
      ...producto,
      alergenos: alergenos as Alergeno[]
    };
  }

  async crear(producto: Producto): Promise<number> {
    const [result] = await this.db.query(
      `INSERT INTO productos (nombre, tipo, cantidad, descripcion, url_imagen, precio, disponible) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        producto.nombre,
        producto.tipo,
        producto.cantidad || 1,
        producto.descripcion || '',
        producto.url_imagen || '',
        producto.precio,
        producto.disponible ?? true
      ]
    );

    return (result as any).insertId;
  }

  async actualizar(id: number, producto: Producto): Promise<void> {
    await this.db.query(
      `UPDATE productos 
       SET nombre = ?, tipo = ?, cantidad = ?, descripcion = ?, url_imagen = ?, precio = ?, disponible = ?
       WHERE id = ?`,
      [
        producto.nombre,
        producto.tipo,
        producto.cantidad || 1,
        producto.descripcion || '',
        producto.url_imagen || '',
        producto.precio,
        producto.disponible ?? true,
        id
      ]
    );
  }

  async eliminar(id: number): Promise<void> {
    await this.db.query(`DELETE FROM productos WHERE id = ?`, [id]);
  }

  async asignarAlergenos(productoId: number, alergenosIds: number[]): Promise<void> {
    await this.db.query(
      `DELETE FROM producto_alergeno WHERE producto_id = ?`,
      [productoId]
    );

    if (alergenosIds && alergenosIds.length > 0) {
      const values = alergenosIds.map(alergenoId => [productoId, alergenoId]);
      await this.db.query(
        `INSERT INTO producto_alergeno (producto_id, alergeno_id) VALUES ?`,
        [values]
      );
    }
  }

  async obtenerTipos(): Promise<string[]> {
    const [rows] = await this.db.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'productos' 
      AND COLUMN_NAME = 'tipo'
      AND TABLE_SCHEMA = DATABASE()
    `);

    if ((rows as any[]).length === 0) return [];

    const columnType = (rows as any[])[0].COLUMN_TYPE;
    // El formato es: enum('valor1','valor2','valor3')
    const match = columnType.match(/enum\((.*)\)/i);
    
    if (!match) return [];

    // Extraer los valores del ENUM y limpiar las comillas
    const tipos = match[1]
      .split(',')
      .map((tipo: string) => tipo.replace(/'/g, '').trim());

    return tipos;
  }
}
