import { useState } from 'preact/hooks';

const API_URL = 'http://localhost:3000';

export default function BotonEliminar({ producto, onEliminar }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMensaje, setModalMensaje] = useState({ tipo: '', mensaje: '' });
  const [eliminando, setEliminando] = useState(false);

  const abrirModal = () => {
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModalMensaje({ tipo: '', mensaje: '' });
  };

  /**
   * Elimina un producto de la base de datos tras confirmación del usuario
   * Muestra spinner durante el proceso y mensaje de éxito/error
   */
  const confirmarEliminacion = async () => {
    setEliminando(true);

    try {
      const res = await fetch(`${API_URL}/productos/${producto.id}`, { 
        method: 'DELETE' 
      });
      
      if (res.ok) {
        setModalMensaje({ tipo: 'success', mensaje: 'Producto eliminado correctamente' });
        setTimeout(() => {
          cerrarModal();
          if (onEliminar) onEliminar();
        }, 1500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setModalMensaje({ tipo: 'error', mensaje: errorData.error || 'No se pudo eliminar' });
        setEliminando(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setModalMensaje({ tipo: 'error', mensaje: `Error de conexión: ${err.message}` });
      setEliminando(false);
    }
  };

  return (
    <>
      <button class="btn-delete" onClick={abrirModal}>
        Eliminar
      </button>

      {modalAbierto && (
        <div class="modal-gestor-overlay" onClick={cerrarModal}>
          <div class="modal-gestor-content" onClick={(e) => e.stopPropagation()}>
            {!modalMensaje.tipo ? (
              <>
                <div class="modal-gestor-icon warning">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="modal-gestor-title">¿Eliminar producto?</h3>
                <p class="modal-gestor-mensaje">
                  ¿Estás seguro de que deseas eliminar <strong>"{producto.nombre}"</strong>?
                  <br />Esta acción no se puede deshacer.
                </p>
                <div class="modal-gestor-botones">
                  <button class="btn-modal-cancelar" onClick={cerrarModal} disabled={eliminando}>
                    Cancelar
                  </button>
                  <button class="btn-modal-confirmar danger" onClick={confirmarEliminacion} disabled={eliminando}>
                    {eliminando ? (
                      <>
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <i class="fa-solid fa-trash"></i>
                        Eliminar
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div class={`modal-gestor-icon ${modalMensaje.tipo}`}>
                  {modalMensaje.tipo === 'success' ? (
                    <i class="fa-solid fa-circle-check"></i>
                  ) : (
                    <i class="fa-solid fa-circle-xmark"></i>
                  )}
                </div>
                <h3 class="modal-gestor-title">
                  {modalMensaje.tipo === 'success' ? '¡Éxito!' : 'Error'}
                </h3>
                <p class="modal-gestor-mensaje">{modalMensaje.mensaje}</p>
                {modalMensaje.tipo === 'error' && (
                  <button class="btn-modal-confirmar" onClick={cerrarModal}>
                    Cerrar
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
