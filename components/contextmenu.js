// CSS 样式
const style = document.createElement("style");
style.textContent = `
  .context-menu {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    padding: 5px 0;
    z-index: 1000; /* 确保菜单在其他元素之上 */
  }
  .context-menu div {
    padding: 5px 10px;
    cursor: pointer;
  }
  .context-menu div:hover {
    background-color: #f0f0f0; /* 鼠标悬停效果 */
  }
`;
document.head.appendChild(style);

export default class ContextMenu {
  constructor(elementId, menus, callback, eventHandle = null) {
    this.elementId = elementId;
    this.menus = menus;
    this.callback = callback;
    this.eventHandle = eventHandle;
    this.menuElement = null; // 初始化为 null
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
      const detail = this.eventHandle ? this.eventHandle(event) : null;
      this.showMenu({ x: event.clientX, y: event.clientY }, detail);
      event.stopPropagation(); // 阻止事件冒泡
    });

    document.addEventListener("click", () => this.hideMenu());
  }

  showMenu(pos, detail) {
    if (!this.menuElement) {
      this.menuElement = this.createMenuElement();
    }
    this.menuElement.style.left = `${pos.x}px`;
    this.menuElement.style.top = `${pos.y}px`;
    this.menuElement.setAttribute("data-detail", detail);
    document.body.appendChild(this.menuElement);
  }

  hideMenu() {
    if (this.menuElement) {
      this.menuElement.remove();
      this.menuElement = null; // 清空引用
    }
  }

  createMenuElement() {
    const menuElement = document.createElement("div");
    menuElement.className = "context-menu";

    this.menus.forEach((menuItem) => {
      const itemElement = document.createElement("div");
      itemElement.textContent = menuItem.label;

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
