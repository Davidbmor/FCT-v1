import { h } from 'preact';

export default function InfoButtonIsland({ productId }) {
  const handleClick = (e) => {
    console.log('Button clicked! Product ID:', productId);
    e.preventDefault();
    e.stopPropagation();
    
    // Forzar recarga completa con los parámetros
    const fullUrl = `${window.location.origin}/info?id=${productId}`;
    console.log('Full URL to navigate:', fullUrl);
    
    // Usar href directo para forzar navegación completa
    setTimeout(() => {
      window.location.href = fullUrl;
    }, 0);
  };

  console.log('InfoButtonIsland rendered with productId:', productId);

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
