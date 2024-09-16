// chatService.mjs
//
import addHtmlToShadowDOM from "/components/gpt/addHtmlToShadowDOM.js";
let doneEvent = new CustomEvent("ChatDone", {
  detail: { key: "done" },
});
export async function generateChatCompletion(
  baseUrl = "https://api.openai.com/v1",
  apiKey = "",
  model = "gpt-4",
  system,
  messages,
  displayNodeId,
  stream = true,
  responsetype = "display",
) {
  const headers = { "Content-Type": "application/json" };

  headers["Authorization"] = `Bearer ${apiKey}`;
  let url = baseUrl + "/chat/completions";

  const payload = createPayload(model, system, messages, stream);
  let response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (responsetype === "display") {
    await handleResponse(response, model, displayNodeId);
  } else {
    return await parseResponse(response, model);
  }
}

function createPayload(model, system, messages, stream) {
  return {
    model: model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: messages },
    ],
    stream: stream,
    frequency_penalty: 1,
    temperature: 0.5,
    top_p: 0.2,
  };
}

async function handleResponse(response, model, displayNodeId) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const displayNode = document.getElementById(displayNodeId);
  const displayTextNode =
    displayNode.childElementCount > 0 ? displayNode.childNodes[0] : displayNode;

  let isHandling = true;

  while (isHandling) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    isHandling = handleDeepSeekChatChunk(chunk, displayNode, displayTextNode);
    // isHandling =
    //   model === "deepseek-chat"
    //     ? handleDeepSeekChatChunk(chunk, displayNode, displayTextNode)
    //     : handleOllamaChunk(chunk, displayNode);
  }

  document.dispatchEvent(doneEvent);
  addHtmlToShadowDOM(displayNode.textContent, displayNode);
}

function handleDeepSeekChatChunk(chunk, displayNode, displayTextNode) {
  let isHandling = true;

  for (const line of chunk.trim().split("data:")) {
    if (line) {
      if (line.match(/\[DONE\]/)) {
        isHandling = false;
        break;
      } else {
        const chunkJson = JSON.parse(line);
        const chatId = displayNode.getAttribute("chatid");

        if (chatId !== chunkJson.id) {
          displayTextNode.textContent = "";
        }

        displayNode.setAttribute("chatid", chunkJson.id);
        if (chunkJson.usage) console.log(chunkJson.usage);
        chunkJson.choices.forEach((choice) => {
          if (choice.delta.content) {
            displayTextNode.innerHTML += choice.delta.content;
          }
        });
      }
    }
  }

  return isHandling;
}

async function parseResponse(response, model) {
  const result = await response.json();
  if (model === "deepseek-chat") {
    return result.choices[0].message.content;
  } else {
    return result.message.content;
  }
}
