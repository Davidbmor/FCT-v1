import { Router } from "express";
import { ProductoController } from "../controllers/ProductoController.js";

export const createProductoRoutes = (productoController: ProductoController) => {
  const router = Router();

  router.get("/productos", productoController.obtenerProductos);

  router.get("/productos/todos", productoController.obtenerTodosProductos);

  router.get("/productos/tipos", productoController.obtenerTipos);

  router.get("/productos/:id", productoController.obtenerProductoPorId);

  router.post("/productos", productoController.añadirProducto);

  router.put("/productos/:id", productoController.editarProducto);

  router.delete("/productos/:id", productoController.eliminarProducto);

  return router;
};
