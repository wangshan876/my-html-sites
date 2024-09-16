// chatModule.js
import { generateChatCompletion } from "/components/gpt/chatService.js";
import { IndexedDBModule } from "/components/autoSaveIndexedDB.js";

const dbname = "_components";
const storename = "_chat_input_configs";
const storenodeid = "_component_chat_config_box";

export function createChatModule(id, options = { callback: null }) {
  const container = document.getElementById(id);
  container.innerHTML = getHTML(options.styles);

  const apiKeyInput = container.querySelector("#api-key");
  const modelInput = container.querySelector("#model");
  const baseUrlInput = container.querySelector("#base-url");
  const defaultPromptInput = container.querySelector("#default-prompt");
  const savebtn = container.querySelector("button");

  const dbModule = new IndexedDBModule(dbname, storename);
  dbModule.initializeFormFromStoreByKey(storenodeid);

  savebtn.addEventListener("click", (e) => {
    dbModule.handleSaveButtonClick(storenodeid);
    options.callback && options.callback();
  });

  async function chat(systemMessage, userMessage, displayNodeId) {
    const apiKey = apiKeyInput.value;
    const model = modelInput.value;
    const baseUrl = baseUrlInput.value;
    const defaultPrompt = defaultPromptInput.value;

    if (!apiKey || !model || !baseUrl) {
      console.log("请填写 API Key、Model和 Base URL。");
      return;
    }

    try {
      const response = await generateChatCompletion(
        baseUrl,
        apiKey,
        model,
        systemMessage || defaultPrompt,
        userMessage,
        displayNodeId,
      );
      return response;
    } catch (error) {
      console.error("生成聊天回复失败:", error);
    }
  }

  return { chat };
}

function getHTML(styles = {}) {
  return `
  <style>
    #_component_chat_config_box {
      display: flex;
      flex-direction: column;
      padding: 20px;
      border-radius: 10px;
      background-color: ${styles.backgroundColor || "#f5f5f5"};
      max-width: 400px;
      margin: 20px auto;
      border: ${styles.border || "0px"};
      color: ${styles.color || "#333"};
    }

    #_component_chat_config_box .row {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    #_component_chat_config_box label {
      margin-right: 10px;
      width: 80px; /* 设置固定宽度 */
      text-align: left; /* 文字靠左对齐 */
    }

    #_component_chat_config_box input,
    #_component_chat_config_box textarea {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    #_component_chat_config_box textarea {
      resize: vertical; /* 允许垂直调整大小 */
      height: 60px; /* 3行的高度 */
    }

    #_component_chat_config_box input:focus,
    #_component_chat_config_box textarea:focus {
      border-color: #007bff;
      outline: none;
    }

    #_component_chat_config_box button {
      align-self: flex-end; /* 按钮靠右对齐 */
      padding: 5px 20px;
      background-color: #515050;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    #_component_chat_config_box button:hover {
      background-color: black;
    }
  </style>

  <div class="box" id="_component_chat_config_box">
    <div class="row">
      <label for="api-key">API Key:</label>
      <input id="api-key" type="password"></input>
    </div>
    <div class="row">
      <label for="model">Model:</label>
      <input id="model" type="text"></input>
    </div>
    <div class="row">
      <label for="base-url">Base URL:</label>
      <input id="base-url" type="text"></input>
    </div>
    <div class="row">
      <label for="default-prompt">Prompt:</label>
      <textarea id="default-prompt" rows="6"></textarea>
    </div>
    <button>保存</button>
  </div>
  `;
}
