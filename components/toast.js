// const customContainer = document.getElementById('custom-container'); // 假设你有一个自定义的容器
// toast('Hello, World!', 3000, {
//     styleOptions: {
//         backgroundColor: '#444',
//         color: 'white',
//         fontSize: '20px',
//         padding: '10px 30px',
//         opacity: '0.9',
//     },
//     horizontal: 'right', // 右侧
//     vertical: 'top', // 顶部
//     offset: '20px', // 距离边缘的距离
//     parent: customContainer // 指定父节点
// });



const style = document.createElement('style');
style.innerHTML = `
.toast {
    visibility: visible;
    opacity: 1;
    text-align: center;
    border-radius: 5px;
    position: fixed;
    z-index: 9999;
    transition: visibility 0s, opacity 0.5s linear;
    opacity: 0.8;
    position: absolute;
    font-size: smaller;
}
`;
document.head.appendChild(style);

function toast(text, duration = 3000, options = {}) {
    const toastNode = document.createElement('div');
    toastNode.classList.add('toast');

    // 设置可配置的样式属性
    const {
        styleOptions = {}, // 样式相关的配置
        horizontal = 'center', // 默认水平位置
        vertical = 'bottom', // 默认垂直位置
        offset = '30px', // 默认偏移量
        parent = document.body // 默认父节点为 document.body
    } = options;

    // 解构样式相关的属性
    const {
        backgroundColor = '#333',
        color = 'yellow',
        fontSize = '17px',
        padding = '5px 20px',
        opacity = '0.8',
    } = styleOptions;

    // 应用样式
    toastNode.style.backgroundColor = backgroundColor;
    toastNode.style.color = color;
    toastNode.style.fontSize = fontSize;
    toastNode.style.padding = padding;
    toastNode.style.opacity = opacity;

    // 根据水平和垂直位置设置样式
    switch (horizontal) {
        case 'left':
            toastNode.style.left = offset;
            toastNode.style.transform = 'none';
            break;
        case 'right':
            toastNode.style.right = offset;
            toastNode.style.transform = 'none';
            break;
        case 'center':
        default:
            toastNode.style.left = '50%';
            toastNode.style.transform = 'translateX(-50%)';
            break;
    }

    switch (vertical) {
        case 'top':
            toastNode.style.top = offset;
            break;
        case 'bottom':
        default:
            toastNode.style.bottom = offset;
            break;
    }

    toastNode.textContent = text;

    // 将 toastNode 附加到指定的父节点
    parent.appendChild(toastNode);

    setTimeout(() => {
        toastNode.remove();
    }, duration);
}
export default toast;

