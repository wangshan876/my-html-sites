// var $reciver = document.querySelector("#reciver")

import {
  $executer,
  $chatwindow,
  $input,
  $sendbtn,
  $modelSelect,
  $dialog,
  $status,
  $autoread,
  $voiceSelect,
} from "./src/global-dom.mjs";
import { populateVoiceList } from "./src/speech.mjs";
import { postRequest, getResponse } from "./src/ollama_api.mjs";
import { appendMeassge } from "./src/messages.mjs";
import { update_models } from "./src/ollama_manager.mjs";
import { resizeObserver } from "./src/global.mjs";
import { executeCommand } from "./src/execute-command.mjs";
import { createChatModule } from "/components/gpt/chatView.js";

const msg_container = document.createElement("div");

const default_values = { voice: 9, model: "wizardlm2:7b-q5_K_M" };

msg_container.classList.add("message");
const promptTest = `
你是一个HTML代码生成器，旨在创建多个格式化为单选按钮选项的日语的多项选择考题。你的主要目标是生成结构清晰、可访问的HTML代码，来组织每个问题及其对应的答案选项。输出应遵循特定模板，其中每道考题都被包含在一个类名为“row”的<div>元素中，并且有一个data-correct-answer属性指示正确答案的值。每道考题的问题应使用<h2>标签包裹，后面跟着一个类名为“radio-group”的<div>元素，其中包含单选按钮选项。每个选项应为类型为“radio”的<input>元素，具有唯一的id和与问题编号对应的name属性，id为了避免其他冲突，随机生成即可。每个radio的label应与其对应的元素关联。输出时请确认题目和答案选项是否匹配，不要输出任何无意义的空选项，不要将label的内容输出到类型为“radio”的<input>中。输出的风格和格式要严格和正式，遵循HTML标准。目标受众包括需要结构良好的HTML代码的开发者和教育工作者，以用于日本多项选择考题。响应的格式应为纯HTML代码，不包含任何额外的文本、解释或代码注释。
  `;
function set_default() {
  $voiceSelect.value = default_values["voice"];
  // $modelSelect.value=default_values['model']
}

export async function init() {
  let chatModule = createChatModule("chat-options");
  document.addEventListener("ChatDone", function (e) {
    console.log("生成完毕:", e.detail);
    if (!$chatwindow.lastChild.classList.contains("receiver", "current"))
      return;
  });
  //添加
  $sendbtn.addEventListener("click", function (e) {
    const id = crypto.randomUUID();
    // if (!$modelSelect.value) return alert("请选择模型");
    const message = $input.value;
    //添加用户message到chatwindow
    const sender = msg_container.cloneNode();
    sender.id = id;
    sender.classList.add("sender");
    sender.textContent = message;
    $chatwindow.appendChild(sender);
    const reciver = msg_container.cloneNode();
    reciver.id = "msg" + id;
    reciver.setAttribute("msgid", id);
    reciver.classList.add("receiver");
    reciver.classList.add("current");

    $chatwindow.appendChild(reciver);

    resizeObserver.observe(reciver);
    chatModule.chat(promptTest, message, reciver.id).then(() => {
      $input.value = "";
    });

    // postRequest({ prompt: message, model: $modelSelect.value })
    //   .then((response) => {
    //     getResponse(response, (parsedResponse) => {
    //       appendMeassge(reciver, parsedResponse);
    //     });
    //   })
    //   .then(() => {
    //     $input.value = "";
    //   });
  });

  populateVoiceList();
  if (
    typeof speechSynthesis !== "undefined" &&
    speechSynthesis.onvoiceschanged !== undefined
  ) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }
  await update_models();
  set_default();
  hljs.highlightAll();

  //test code.
  // $executer.addEventListener("click", (e) => {
  //   executeCommand("ls");
  // });
}
