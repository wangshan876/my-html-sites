export default class ContextMenu {
  constructor(elementId, menus, callback) {
    this.elementId = elementId;
    this.menus = menus;
    this.callback = callback;
    this.init();
  }

  init() {
    const element = document.getElementById(this.elementId);
    if (!element) {
      console.error(`Element with id ${this.elementId} not found.`);
      return;
    }

    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.showMenu(event.clientX, event.clientY);
    });

    document.addEventListener("click", () => this.hideMenu());
  }

  showMenu(x, y) {
    const menuElement = this.createMenuElement();
    menuElement.style.position = "absolute";
    menuElement.style.left = `${x}px`;
    menuElement.style.top = `${y}px`;
    document.body.appendChild(menuElement);
  }

  hideMenu() {
    const menuElement = document.querySelector(".context-menu");
    if (menuElement) {
      menuElement.remove();
    }
  }

  createMenuElement() {
    const menuElement = document.createElement("div");
    menuElement.className = "context-menu";
    menuElement.style.backgroundColor = "#fff";
    menuElement.style.border = "1px solid #ccc";
    menuElement.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.1)";
    menuElement.style.padding = "5px 0";

    this.menus.forEach((menuItem) => {
      const itemElement = document.createElement("div");
      itemElement.textContent = menuItem.label;
      itemElement.style.padding = "5px 10px";
      itemElement.style.cursor = "pointer";

      itemElement.addEventListener("click", () => {
        this.callback(menuItem.action);
        this.hideMenu();
      });

      itemElement.addEventListener("contextmenu", (event) => {
        event.preventDefault();
      });

      menuElement.appendChild(itemElement);
    });

    return menuElement;
  }
}
