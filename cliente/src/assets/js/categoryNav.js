document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.left-nav a.selector');
  const sections = document.querySelectorAll('.menu-section-container');
  
  // Smooth scroll para las categorías del sidebar
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Scroll spy - actualizar categoría activa según scroll
  function updateActiveCategory() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 150; // offset para el header
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = sectionId;
      }
    });
    
    // Remover clase 'active' de todos los links
    navLinks.forEach(link => {
      link.parentElement.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.parentElement.classList.add('active');
      }
    });
  }
  
  // Ejecutar al cargar y al hacer scroll
  window.addEventListener('scroll', updateActiveCategory);
  updateActiveCategory();
});
