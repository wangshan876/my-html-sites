import { getModels } from "./ollama_api.mjs";
import { $modelSelect } from "./global-dom.mjs";
const option_template = document.createElement("option");
var ollama_models = {};
var ollama_models_keys = [];

function modelsRender() {
  ollama_models_keys = Object.keys(ollama_models);
  ollama_models_keys.forEach((key) => {
    if (ollama_models[key] && ollama_models[key].length > 0) {
      ollama_models[key].forEach((name) => {
        const option = option_template.cloneNode();
        option.textContent = name;
        option.value = name;
        $modelSelect.appendChild(option);
      });
    }
  });
}

export async function update_models() {
  await getModels().then((response) => {
    ollama_models = {};
    if (response && response.models) {
      response.models.forEach((model) => {
        const family = model.details.family;
        const name = model.name;
        if (!ollama_models[family]) ollama_models[family] = [];
        ollama_models[family].push(model.name);
      });
      // modelsRender()
    }
  });
}
