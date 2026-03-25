document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const navLink = document.querySelectorAll(".nav-item");

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener("click", mobileMenu);
  navLink.forEach((n) => n.addEventListener("click", closeMenu));

  function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  }

  function closeMenu(event) {
    if (!event.target.closest('.dropdown')) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }
  }
});
