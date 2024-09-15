const style_str = `
  ._chat_coder .row {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
  }

   ._chat_coder  h2 {
      color: #333;
      margin-bottom: 15px;
  }

   ._chat_coder  .radio-group {
      display: flex;
      flex-direction: column;
  }

   ._chat_coder  input[type="radio"] {
      margin-right: 10px;
      cursor: pointer;
  }

   ._chat_coder  label {
      margin-bottom: 10px;
      cursor: pointer;
      font-size: 16px;
      color: #555;
  }

   ._chat_coder  input[type="radio"]:checked + label {
      font-weight: bold;
      color: #007BFF;
  }

  /* 添加悬停效果 */
   ._chat_coder  label:hover {
      color: #007BFF;
  }
  `;
const style = document.createElement("style");
style.innerText = style_str;
document.head.appendChild(style);
export default function addHtmlToShadowDOM(
  inputString,
  node,
  is_parse_html = true,
) {
  // 创建一个新的元素
  const host = document.createElement("div");
  host.style.display = "none";
  // host.style.position = "absolute";
  // host.style.top = "0";
  // host.style.left = "0";
  host.style.width = "100%";
  host.style.height = "100%";
  host.style.backgroundColor = "aliceblue";

  host.classList.add("_chat-coder");

  // 使用正则表达式提取代码块
  // const codeBlocks = inputString.match(/```(.*?)```/gs);
  const codeBlocks = inputString.match(/```(.*?)((?=```)|$)/gs) || [];

  console.log();
  // 如果找到了代码块
  if (codeBlocks) {
    // 将代码块格式化并添加到 Shadow DOM
    const formattedCodeBlocks = codeBlocks
      .map((block) => {
        // 提取语言
        const languageMatch = block.match(/```(\w+)/);
        const language = languageMatch ? languageMatch[1] : null;
        console.log("language", language);
        // 去掉开头的 ``` 和结尾的 ```
        const codeContent = block
          .replace(/```(\w+)?\s*/g, "")
          .replace(/```/g, "")
          .trim();
        console.log("codeContent", codeContent);

        if (is_parse_html && language === "html") {
          return codeContent; // 直接返回处理后的 HTML 代码
        } else {
          // 否则返回 <pre><code> 标签
          return `<pre><code>${codeContent}</code></pre>`;
        }
      })
      .join("");

    // 将格式化后的代码添加到 Shadow DOM
    host.innerHTML = formattedCodeBlocks;
  } else {
    // 如果没有找到代码块，可以选择添加其他内容
    host.innerHTML = "<p>No code blocks found.</p>";
  }

  if (!["absolute", "relative", "fixed"].includes(node.style.position)) {
    node.style.position = "relative";
  }
  const originWrapper = document.createElement("div");
  originWrapper.classList.add("content");
  originWrapper.innerHTML = node.innerHTML;
  node.innerHTML = "";
  node.append(originWrapper, host);

  node.querySelector(".content").addEventListener("click", () => {
    node.querySelector("._chat-coder").style.display = "block";
    node.querySelector(".content").style.display = "none";
  });
  node.querySelector("._chat-coder").addEventListener("click", (e) => {
    if (
      ["INPUT", "BUTTON", "LABEL", "TEXTAREA", "H1", "H2", "H3"].includes(
        e.target.tagName,
      )
    )
      return;
    node.querySelector("._chat-coder").style.display = "none";
    node.querySelector(".content").style.display = "block";
  });
}
