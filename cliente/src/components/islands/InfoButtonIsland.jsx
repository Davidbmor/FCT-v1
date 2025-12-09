import { h } from 'preact';

export default function InfoButtonIsland({ productId }) {
  /**
   * Navega a la página de información del producto
   * Usa window.location.href para forzar recarga completa
   */
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fullUrl = `${window.location.origin}/info?id=${productId}`;
    
    setTimeout(() => {
      window.location.href = fullUrl;
    }, 0);
  };

  return (
    <button 
      class="info" 
      onClick={handleClick} 
      type="button"
      style={{ cursor: 'pointer' }}
    >
      <i class="fa-solid fa-circle-info"></i> Info
    </button>
  );
}
