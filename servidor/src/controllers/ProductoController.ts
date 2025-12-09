import { Request, Response } from "express";
import { ProductoModel } from "../models/Producto.js";
import fs from 'fs';
import path from 'path';

export class ProductoController {
  private productoModel: ProductoModel;

  constructor(productoModel: ProductoModel) {
    this.productoModel = productoModel;
  }

  obtenerProductos = async (req: Request, res: Response) => {
    try {
      const productos = await this.productoModel.obtenerDisponibles();
      res.json(productos);
    } catch (err) {
      console.error("Error obteniendo productos:", err);
      res.status(500).json({ error: "Error al obtener los productos" });
    }
  };

  obtenerTodosProductos = async (req: Request, res: Response) => {
    try {
      const productos = await this.productoModel.obtenerTodos();
      res.json(productos);
    } catch (err) {
      console.error("Error obteniendo productos:", err);
      res.status(500).json({ error: "Error al obtener los productos" });
    }
  };

  obtenerProductoPorId = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const producto = await this.productoModel.obtenerPorId(Number(id));
      
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json(producto);
    } catch (err) {
      console.error("Error obteniendo producto:", err);
      res.status(500).json({ error: "Error al obtener el producto" });
    }
  };

  /**
   * Crea un nuevo producto en la base de datos
   * Procesa imágenes base64, las guarda como archivos y asigna alérgenos
   */
  añadirProducto = async (req: Request, res: Response) => {
    try {
      const { nombre, tipo, descripcion, url_imagen, precio, cantidad, alergenos } = req.body;

      if (!nombre || !tipo || precio === undefined) {
        return res.status(400).json({ 
          error: "Faltan campos requeridos: nombre, tipo, precio" 
        });
      }

      let rutaImagen = '';
      if (url_imagen && url_imagen.startsWith('data:image')) {
        const matches = url_imagen.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const extension = matches[1];
          const base64Data = matches[2];
          const nombreArchivo = `producto_${Date.now()}.${extension}`;
          const rutaCompleta = path.join(process.cwd(), 'imagenes', nombreArchivo);
          
          fs.writeFileSync(rutaCompleta, base64Data, 'base64');
          rutaImagen = `/imagenes/${nombreArchivo}`;
        }
      }

      const productoId = await this.productoModel.crear({
        nombre,
        tipo,
        cantidad: cantidad ? parseInt(cantidad) : 1,
        descripcion: descripcion || '',
        url_imagen: rutaImagen,
        precio: parseFloat(precio),
        disponible: true
      });

      if (alergenos && alergenos.length > 0) {
        await this.productoModel.asignarAlergenos(productoId, alergenos);
      }

      res.status(201).json({ 
        id: productoId, 
        message: "Producto añadido correctamente" 
      });
    } catch (err) {
      console.error("Error añadiendo producto:", err);
      res.status(500).json({ error: "Error al añadir el producto" });
    }
  };

  /**
   * Actualiza un producto existente
   * Gestiona reemplazo de imágenes eliminando archivos antiguos
   */
  editarProducto = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nombre, tipo, descripcion, url_imagen, precio, cantidad, alergenos } = req.body;

      const productoExistente = await this.productoModel.obtenerPorId(Number(id));
      if (!productoExistente) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      let rutaImagen = url_imagen || productoExistente.url_imagen;
      if (url_imagen && url_imagen.startsWith('data:image')) {
        const matches = url_imagen.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const extension = matches[1];
          const base64Data = matches[2];
          const nombreArchivo = `producto_${Date.now()}.${extension}`;
          const rutaCompleta = path.join(process.cwd(), 'imagenes', nombreArchivo);
          
          if (productoExistente.url_imagen && productoExistente.url_imagen.startsWith('/imagenes/')) {
            const rutaAnterior = path.join(process.cwd(), productoExistente.url_imagen.substring(1));
            if (fs.existsSync(rutaAnterior)) {
              fs.unlinkSync(rutaAnterior);
            }
          }
          
          fs.writeFileSync(rutaCompleta, base64Data, 'base64');
          rutaImagen = `/imagenes/${nombreArchivo}`;
        }
      }

      await this.productoModel.actualizar(Number(id), {
        nombre,
        tipo,
        cantidad: cantidad !== undefined ? parseInt(cantidad) : productoExistente.cantidad,
        descripcion: descripcion || '',
        url_imagen: rutaImagen,
        precio: parseFloat(precio),
        disponible: productoExistente.disponible
      });

      await this.productoModel.asignarAlergenos(Number(id), alergenos || []);

      res.json({ message: "Producto actualizado correctamente" });
    } catch (err) {
      console.error("Error actualizando producto:", err);
      res.status(500).json({ error: "Error al actualizar el producto" });
    }
  };

  eliminarProducto = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const producto = await this.productoModel.obtenerPorId(Number(id));
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      if (producto.url_imagen && producto.url_imagen.startsWith('/imagenes/')) {
        const rutaImagen = path.join(process.cwd(), producto.url_imagen.substring(1));
        if (fs.existsSync(rutaImagen)) {
          fs.unlinkSync(rutaImagen);
        }
      }

      await this.productoModel.asignarAlergenos(Number(id), []);
      await this.productoModel.eliminar(Number(id));

      res.json({ message: "Producto eliminado correctamente" });
    } catch (err) {
      console.error("Error eliminando producto:", err);
      res.status(500).json({ error: "Error al eliminar el producto" });
    }
  };

  obtenerTipos = async (req: Request, res: Response) => {
    try {
      const tipos = await this.productoModel.obtenerTipos();
      res.json(tipos);
    } catch (err) {
      console.error("Error obteniendo tipos:", err);
      res.status(500).json({ error: "Error al obtener los tipos" });
    }
  };
}
