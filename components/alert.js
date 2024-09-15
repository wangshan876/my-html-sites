(function() {
    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        .custom-alert {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(30, 30, 30, 0.9); /* 暗色系背景，带透明度 */
            border: 1px solid rgba(255, 255, 255, 0.3); /* 边框颜色 */
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white; /* 字体颜色为白色 */
        }
        .hidden {
            display: none;
        }
        .alert-content {
            text-align: center;
        }
        .alert-button {
            margin-top: 10px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: rgba(0, 123, 255, 0.8); /* 按钮背景色，带透明度 */
            color: white;
            cursor: pointer;
        }
        .alert-button:hover {
            background-color: rgba(0, 123, 255, 1); /* 悬停时的按钮背景色 */
        }
    `;
    document.head.appendChild(style);

    // 创建 alert 组件
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert hidden';
    alertDiv.innerHTML = `
        <div class="alert-content">
            <div id="alertMessage">这是一个自定义的 Alert!</div>
            <button class="alert-button small" id="closeAlert">关闭</button>
        </div>
    `;
    document.body.appendChild(alertDiv);

    // 保存原始的 alert 函数
    const originalAlert = window.alert;

    // 自定义 alert 函数
    window.alert = function(message) {
        document.getElementById('alertMessage').textContent = message;
        alertDiv.classList.remove('hidden');
    };

    // 关闭自定义 alert
    document.getElementById('closeAlert').addEventListener('click', function() {
        alertDiv.classList.add('hidden');
    });
})();
