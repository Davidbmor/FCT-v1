import { useState, useEffect } from 'preact/hooks';

const API_URL = 'http://localhost:3000';

export default function FormularioProducto() {
  const [alergenos, setAlergenos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [editando, setEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    descripcion: '',
    url_imagen: '',
    precio: '',
    cantidad: '',
    alergenos: []
  });

  const [previewImg, setPreviewImg] = useState(null);
  const [modalMensaje, setModalMensaje] = useState({ visible: false, tipo: '', mensaje: '' });

  useEffect(() => {
    cargarAlergenos();
    cargarTipos();
    
    window.editarProductoGlobal = (producto) => {
      setEditando(producto);
      const tipoValue = producto.tipo ? producto.tipo.toLowerCase() : '';
      setFormData({
        nombre: producto.nombre,
        tipo: tipoValue,
        descripcion: producto.descripcion || '',
        url_imagen: producto.url_imagen || '',
        precio: producto.precio.toString(),
        cantidad: producto.cantidad ? producto.cantidad.toString() : '1',
        alergenos: producto.alergenos 
          ? producto.alergenos.map(a => a.id)
          : []
      });
      setPreviewImg(producto.url_imagen ? `http://localhost:3000${producto.url_imagen}` : null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.recargarProductosGlobal = () => {};
  }, []);

  const cargarAlergenos = async () => {
    try {
      const res = await fetch(`${API_URL}/alergenos`);
      const data = await res.json();
      setAlergenos(data);
    } catch (err) {
      console.error('Error cargando alergenos:', err);
    }
  };

  const cargarTipos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos/tipos`);
      const data = await res.json();
      setTipos(data);
    } catch (err) {
      console.error('Error cargando tipos:', err);
    }
  };

  /**
   * Convierte imagen seleccionada a base64 para preview y envío
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
        setFormData({ ...formData, url_imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
        setFormData({ ...formData, url_imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAlergeno = (id) => {
    setFormData(prev => ({
      ...prev,
      alergenos: prev.alergenos.includes(id)
        ? prev.alergenos.filter(a => a !== id)
        : [...prev.alergenos, id]
    }));
  };

  /**
   * Envía el formulario de producto (crear o actualizar)
   * Gestiona conversión de tipos y manejo de imágenes base64
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const datosEnviar = editando ? {} : {
      ...formData,
      precio: parseFloat(formData.precio),
      cantidad: parseInt(formData.cantidad) || 1
    };

    if (editando) {
      if (formData.nombre) datosEnviar.nombre = formData.nombre;
      if (formData.tipo) datosEnviar.tipo = formData.tipo;
      if (formData.descripcion) datosEnviar.descripcion = formData.descripcion;
      if (formData.url_imagen && formData.url_imagen !== editando.url_imagen) {
        datosEnviar.url_imagen = formData.url_imagen;
      }
      if (formData.precio) datosEnviar.precio = parseFloat(formData.precio);
      if (formData.cantidad) datosEnviar.cantidad = parseInt(formData.cantidad);
      datosEnviar.alergenos = formData.alergenos;
    }
    
    try {
      const url = editando 
        ? `${API_URL}/productos/${editando.id}`
        : `${API_URL}/productos`;
      
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar)
      });

      if (res.ok) {
        setModalMensaje({
          visible: true,
          tipo: 'success',
          mensaje: editando ? 'Producto actualizado correctamente' : 'Producto añadido correctamente'
        });
        setTimeout(() => {
          limpiarForm();
          setModalMensaje({ visible: false, tipo: '', mensaje: '' });
          if (window.recargarProductosGlobal) {
            window.recargarProductosGlobal();
          }
        }, 1500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setModalMensaje({
          visible: true,
          tipo: 'error',
          mensaje: errorData.error || res.statusText
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setModalMensaje({
        visible: true,
        tipo: 'error',
        mensaje: `Error de conexión: ${err.message}`
      });
    }
  };

  const limpiarForm = () => {
    setFormData({
      nombre: '',
      tipo: '',
      descripcion: '',
      url_imagen: '',
      precio: '',
      cantidad: '',
      alergenos: []
    });
    setPreviewImg(null);
    setEditando(null);
  };

  return (
    <div class="form-product">
      <h2>{editando ? 'Editar plato' : 'Añadir nuevo plato'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div 
          class="dropzone" 
          id="dropzone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('fileInput').click()}
        >
          {previewImg ? (
            <img src={previewImg} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px' }} />
          ) : (
            <>
              <i class="fa-solid fa-image"></i>
              <p>Arrastra una imagen aquí o haz clic</p>
            </>
          )}
          <input 
            type="file" 
            id="fileInput" 
            hidden 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div class="form-group">
          <label>Título del plato</label>
          <input 
            type="text" 
            placeholder="Ej. Nigiri de salmón"
            value={formData.nombre}
            onInput={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required={!editando}
          />
        </div>

        <div class="form-group">
          <label>Tipo de plato</label>
          <select 
            class="tipo-plato"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            required={!editando}
          >
            <option value="">Seleccionar tipo...</option>
            {tipos.map(tipo => (
              <option key={tipo} value={tipo.toLowerCase()}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div class="form-group">
          <label>Descripción</label>
          <textarea 
            placeholder="Describe brevemente el plato..."
            value={formData.descripcion}
            onInput={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          ></textarea>
        </div>

        <div class="form-group">
          <label>Alergenos</label>
          <div class="alerg-container">
            {alergenos.map(alerg => (
              <label key={alerg.id}>
                <input 
                  type="checkbox" 
                  checked={formData.alergenos.includes(alerg.id)}
                  onChange={() => toggleAlergeno(alerg.id)}
                />
                {' '}{alerg.nombre}
              </label>
            ))}
          </div>
        </div>

        <div class="form-group">
          <label>Precio (€)</label>
          <input 
            type="number" 
            value={formData.precio}
            step="0.01"
            min="0"
            placeholder="0.00"
            onInput={(e) => setFormData({ ...formData, precio: e.target.value })}
            required={!editando}
          />
        </div>

        <div class="form-group">
          <label>Cantidad</label>
          <input 
            type="number" 
            value={formData.cantidad}
            min="1"
            placeholder="1"
            onInput={(e) => setFormData({ ...formData, cantidad: e.target.value })}
            required={!editando}
          />
        </div>
            <br></br>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" class="btn-save">
            {editando ? 'Actualizar' : 'Guardar'}
          </button>
          {editando && (
            <button 
              type="button" 
              class="btn-cancel"
              onClick={limpiarForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {modalMensaje.visible && (
        <div class="modal-gestor-overlay" onClick={() => setModalMensaje({ visible: false, tipo: '', mensaje: '' })}>
          <div class="modal-gestor-content" onClick={(e) => e.stopPropagation()}>
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
              <button 
                class="btn-modal-confirmar" 
                onClick={() => setModalMensaje({ visible: false, tipo: '', mensaje: '' })}
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
