// chatModule.js
import { generateChatCompletion } from "/components/gpt/chatService.js";
import { IndexedDBModule } from "/components/autoSaveIndexedDB.js";

const dbname = "_components";
const storename = "_chat_input_configs";
const storenodeid = "_component_chat_config_box";

export function createChatModule(id) {
  const container = document.getElementById(id);
  container.innerHTML = getHTML();

  const apiKeyInput = container.querySelector("#api-key");
  const modelInput = container.querySelector("#model");
  const baseUrlInput = container.querySelector("#base-url");
  const savebtn = container.querySelector("button");

  const dbModule = new IndexedDBModule(dbname, storename);
  dbModule.initializeFormFromStoreByKey(storenodeid);

  savebtn.addEventListener("click", (e) =>
    dbModule.handleSaveButtonClick(storenodeid),
  );

  async function chat(systemMessage, userMessage, displayNodeId) {
    const apiKey = apiKeyInput.value;
    const model = modelInput.value;
    const baseUrl = baseUrlInput.value;

    if (!apiKey || !model || !baseUrl) {
      console.log("请填写 API Key、Model和 Base URL。");
      return;
    }

    try {
      const response = await generateChatCompletion(
        baseUrl,
        apiKey,
        model,
        systemMessage,
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

function getHTML() {
  return `
  <style>
    #_component_chat_config_box {
      display: flex;
      flex-direction: column;
      padding: 20px;
      border-radius: 10px;
      background-color: #f5f5f5;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      margin: 20px auto;
    }

    #_component_chat_config_box .row {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    #_component_chat_config_box label {
      font-weight: bold;
      margin-right: 10px;
      width: 80px; /* 设置固定宽度 */
      text-align: left; /* 文字靠左对齐 */
      color: #333;
    }

    #_component_chat_config_box input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    #_component_chat_config_box input:focus {
      border-color: #007bff;
      outline: none;
    }

    #_component_chat_config_box button {
      align-self: flex-end; /* 按钮靠右对齐 */
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    #_component_chat_config_box button:hover {
      background-color: #0056b3;
    }
  </style>

  <div class="box" id="_component_chat_config_box">
    <div class="row">
      <label for="api-key">API Key:</label>
      <input id="api-key" type="password"></input>
    </div>
    <div class="row">
      <label for="model">模型:</label>
      <input id="model" type="text"></input>
    </div>
    <div class="row">
      <label for="base-url">Base URL:</label>
      <input id="base-url" type="text"></input>
    </div>
    <button>保存</button>
  </div>
  `;
}
