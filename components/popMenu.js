class PopupMenu {
  constructor(menuId, options = {}) {
    this.menu = document.getElementById(menuId);
    this.position = options.position || "left";
    this.isOpen = false;
    this.useIndicator = options.useIndicator || false;
    this.enableEdgeOpen = options.enableEdgeOpen || false;
    this.indicator = null;
    this.size = { height: "100%", width: "600px", ...options.size };
    this.toggleButtonId = options.toggleButtonId || null;

    const _styles = options.styles;
    this.styles = {
      backgroundColor: _styles?.backgroundColor || "#333",
      color: _styles?.color || "white",
      top: _styles?.top || 0,
      left: _styles?.left || 0,
    };
    // this.styles = {
    //   backgroundColor: "#333",
    //   color: "white",
    //   top: "0",
    //   left: "0",
    //   ...options.styles,
    // };

    this.addStyles();

    if (this.useIndicator) {
      this.createIndicator();
    }

    document.addEventListener("click", this.handleClickOutside.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this)); // 绑定鼠标移动事件
  }

  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .myapp-popup-menu {
                overflow-y:auto;
                z-index: 9999;
                width:${this.size.width};
                height: ${this.size.height};
                top:${this.styles.top};
                background-color: ${this.styles.backgroundColor};
                color:  ${this.styles.color};
                position: fixed;
                display:none;
                left: ${this.size.width == "auto" ? "-800px" : -this.size.width};
                transition: left 1s ease-out;
            }

            .myapp-popup-menu.open {
                transform: translateX(0);
                left:  ${this.styles.left};
                display:block;
            }

            .myapp-popup-menu a {
                display: block;
                padding: 15px;
                text-decoration: none;
                color: white;
            }

            .myapp-popup-menu a:hover {
                background-color: #575757;
            }

            #toggle-button {
                position: absolute;
                top: 20px;
                left: 20px;
                padding: 10px 15px;
                background-color: #007BFF;
                color: white;
                border: none;
                cursor: pointer;
            }

            .myapp-popup-indicator {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                display: none;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                text-align: center;
                line-height: 100vh;
                font-size: 20px;
                z-index: 999;
            }
        `;
    document.head.appendChild(style);
  }

  createIndicator() {
    this.indicator = document.createElement("div");
    this.indicator.id = "popup-indicator";
    this.indicator.className = "myapp-popup-indicator";
    this.indicator.textContent = `滑动到${this.position}边缘以打开菜单`;
    document.body.appendChild(this.indicator);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.menu.classList.toggle("open", this.isOpen);
    if (this.indicator) {
      this.indicator.style.display = "none"; // 隐藏提示
    }
  }

  handleClickOutside(event) {
    const isClickInsideMenu =
      this.menu.contains(event.target) ||
      event.target === document.getElementById("toggle-button");
    if (
      !isClickInsideMenu &&
      event.target.id !== this.toggleButtonId &&
      this.isOpen
    ) {
      this.toggle();
    }
  }

  handleMouseMove(event) {
    if (
      this.useIndicator &&
      !this.isOpen &&
      (event.clientX < 10 ||
        event.clientX > window.innerWidth - 10 ||
        event.clientY < 10 ||
        event.clientY > window.innerHeight - 10)
    ) {
      this.indicator.style.display = "block";
    } else if (this.indicator) {
      this.indicator.style.display = "none";
    }

    // 如果启用鼠标靠近左侧边缘时打开菜单的功能
    if (this.enableEdgeOpen && event.clientX < 10 && !this.isOpen) {
      this.toggle(); // 打开菜单
    }
  }
}

export default PopupMenu;
