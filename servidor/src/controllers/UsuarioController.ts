import { Request, Response } from "express";
import { UsuarioModel } from "../models/Usuario.js";

export class UsuarioController {
  private usuarioModel: UsuarioModel;

  constructor(usuarioModel: UsuarioModel) {
    this.usuarioModel = usuarioModel;
  }

  /**
   * Autentica usuarios según su rol (cliente, gestor, camarero)
   * Los clientes no requieren contraseña, otros roles sí
   */
  login = async (req: Request, res: Response) => {
    try {
      const { nombre_usuario, contrasena, rol } = req.body;

      if (!nombre_usuario || !rol) {
        return res.status(400).json({ 
          success: false,
          error: "Nombre de usuario y rol son requeridos" 
        });
      }

      if (rol === 'cliente') {
        const usuario = await this.usuarioModel.obtenerPorNombre(nombre_usuario);
        
        if (usuario && usuario.rol === 'cliente') {
          return res.json({
            success: true,
            usuario: {
              id: usuario.id,
              nombre_usuario: usuario.nombre_usuario,
              rol: usuario.rol
            }
          });
        } else {
          return res.status(401).json({
            success: false,
            error: "Usuario no encontrado"
          });
        }
      }

      if (!contrasena) {
        return res.status(400).json({
          success: false,
          error: "Contraseña requerida para este rol"
        });
      }

      const usuario = await this.usuarioModel.autenticar(nombre_usuario, contrasena);

      if (usuario && usuario.rol === rol) {
        return res.json({
          success: true,
          usuario: {
            id: usuario.id,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: "Credenciales incorrectas"
        });
      }
    } catch (err) {
      console.error("Error en login:", err);
      res.status(500).json({ 
        success: false,
        error: "Error al iniciar sesión" 
      });
    }
  };

  obtenerUsuarios = async (req: Request, res: Response) => {
    try {
      const usuarios = await this.usuarioModel.obtenerTodos();
      res.json(usuarios);
    } catch (err) {
      console.error("Error obteniendo usuarios:", err);
      res.status(500).json({ error: "Error al obtener los usuarios" });
    }
  };
}
