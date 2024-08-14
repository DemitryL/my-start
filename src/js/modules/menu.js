// Menu
const menu = () => {
  let menu = document.querySelector(".menu");
  const navbar = document.querySelector(".header__nav");
  const navLink = document.querySelectorAll(".nav__link");

  const showMenu = () => {
    menu.classList.toggle("move");
    navbar.classList.toggle("nav--active");
  };

  menu.addEventListener("click", showMenu);

  /*============= REMOVE MENU MOBILE =============*/
  const linkAction = () => {
    const navMenu = document.querySelector(".header__nav");
    /* When we click on each nav__link, we remove the show-menu class */
    navMenu.classList.remove("nav--active");
    menu.classList.remove("move");
  };
  navLink.forEach((n) => n.addEventListener("click", linkAction));
};

export default menu;
