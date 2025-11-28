document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar-custom');
  let lastScrollTop = 0;
  let ticking = false;

  function updateNavbar(scrollTop) {
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', function() {
    lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateNavbar(lastScrollTop);
        ticking = false;
      });
      ticking = true;
    }
  });

  const dropdownMenus = document.querySelectorAll('.dropdown-menu');
  dropdownMenus.forEach(menu => {
    menu.addEventListener('show.bs.dropdown', function() {
      this.style.display = 'block';
      this.style.opacity = '0';
      setTimeout(() => {
        this.style.opacity = '1';
      }, 10);
    });
  });

  const navLinks = document.querySelectorAll('.nav-link');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const parentLink = parentDropdown.querySelector('.nav-link.dropdown-toggle');
        if (parentLink) {
          parentLink.classList.add('active');
        }
      }
    }
  });
});
