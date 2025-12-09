document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.left-nav a.selector');
  const sections = document.querySelectorAll('.menu-section-container');
  
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

  /**
   * Actualiza la categoría activa en el menú según la posición del scroll
   */
  function updateActiveCategory() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 150;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = sectionId;
      }
    });
    
    navLinks.forEach(link => {
      link.parentElement.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.parentElement.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveCategory);
  updateActiveCategory();
});
