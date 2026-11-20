const filters = document.querySelectorAll(".filters button");
const cards = document.querySelectorAll(".game");
filters.forEach((button) => button.addEventListener("click", () => {
  filters.forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  const category = button.dataset.filter;
  cards.forEach((card) => { card.hidden = category !== "all" && card.dataset.category !== category; });
}));

const menu = document.querySelector(".menu");
const desktopNav = document.querySelector(".topbar nav");
if (menu && desktopNav) {
  menu.addEventListener("click", () => {
    const opened = desktopNav.classList.toggle("mobile-open");
    menu.setAttribute("aria-expanded", String(opened));
  });
  desktopNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => desktopNav.classList.remove("mobile-open")));
}