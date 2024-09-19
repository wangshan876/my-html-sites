export default class ContextMenu {
  constructor(elementId, menus, callback, eventHandle = new Function()) {
    this.elementId = elementId;
    this.menus = menus;
    this.callback = callback;
    this.eventHandle = eventHandle;
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
      const detail = this.eventHandle(event);
      if (detail) {
        this.showMenu({ x: event.clientX, y: event.clientY }, detail);
        event.stopPropagation(); // 阻止事件冒泡
      }
    });

    document.addEventListener("click", () => this.hideMenu());
  }

  showMenu(pos, detail) {
    const menuElement = this.createMenuElement();
    menuElement.style.position = "absolute";
    menuElement.style.left = `${pos.x}px`;
    menuElement.style.top = `${pos.y}px`;
    menuElement.setAttribute("data-detail", detail);
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
        const detail = menuElement.getAttribute("data-detail");
        this.callback(menuItem.action, detail);
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
