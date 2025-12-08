import { useState } from "preact/hooks";

export default function ModalComensales() {
  const [adultos, setAdultos] = useState(1);
  const [ninos, setNinos] = useState(0);

  const precioAdulto = 18.90;
  const precioNino = 9.90;

  const calcularTotal = () => {
    return (adultos * precioAdulto + ninos * precioNino).toFixed(2);
  };

  const handleConfirmar = () => {
    // Guardar en localStorage
    const comensales = {
      adultos,
      ninos,
      precioBuffet: calcularTotal()
    };
    
    localStorage.setItem('comensales', JSON.stringify(comensales));
    
    // Continuar al menú
    window.location.href = '/carta';
  };

  const incrementar = (tipo) => {
    if (tipo === 'adultos') {
      setAdultos(prev => Math.min(prev + 1, 20));
    } else {
      setNinos(prev => Math.min(prev + 1, 20));
    }
  };

  const decrementar = (tipo) => {
    if (tipo === 'adultos') {
      setAdultos(prev => Math.max(prev - 1, 0));
    } else {
      setNinos(prev => Math.max(prev - 1, 0));
    }
  };

  const totalComensales = adultos + ninos;

  return (
    <div class="modal-comensales-overlay">
      <div class="modal-comensales-content">
        <div class="modal-comensales-header">
          <h2>
            <i class="fa-solid fa-users"></i>
            ¿Cuántos sois?
          </h2>
          <p>Indica el número de comensales para tu mesa</p>
        </div>

        <div class="comensales-seleccion">
          {/* Adultos */}
          <div class="comensal-item">
            <div class="comensal-info">
              <div class="comensal-icon">
                <i class="fa-solid fa-user"></i>
              </div>
              <div class="comensal-text">
                <h3>Adultos</h3>
                <p>{precioAdulto}€ / persona</p>
              </div>
            </div>
            <div class="comensal-counter">
              <button 
                class="counter-btn minus"
                onClick={() => decrementar('adultos')}
                disabled={adultos === 0}
              >
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="counter-value">{adultos}</span>
              <button 
                class="counter-btn plus"
                onClick={() => incrementar('adultos')}
                disabled={adultos >= 20}
              >
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          {/* Niños */}
          <div class="comensal-item">
            <div class="comensal-info">
              <div class="comensal-icon nino">
                <i class="fa-solid fa-child"></i>
              </div>
              <div class="comensal-text">
                <h3>Niños</h3>
                <p>{precioNino}€ / niño</p>
              </div>
            </div>
            <div class="comensal-counter">
              <button 
                class="counter-btn minus"
                onClick={() => decrementar('ninos')}
                disabled={ninos === 0}
              >
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="counter-value">{ninos}</span>
              <button 
                class="counter-btn plus"
                onClick={() => incrementar('ninos')}
                disabled={ninos >= 20}
              >
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="comensales-resumen">
          <div class="resumen-line">
            <span>Total comensales:</span>
            <strong>{totalComensales}</strong>
          </div>
          <div class="resumen-line total">
            <span>Precio Buffet:</span>
            <strong>{calcularTotal()}€</strong>
          </div>
          <p class="resumen-nota">
            <i class="fa-solid fa-info-circle"></i>
            Bebidas no incluidas
          </p>
        </div>

        <button 
          class="btn-confirmar-comensales"
          onClick={handleConfirmar}
          disabled={totalComensales === 0}
        >
          Continuar al Menú
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}
