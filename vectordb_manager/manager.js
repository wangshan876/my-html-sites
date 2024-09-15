import * as api from "/components/vectordb/api.mjs";
import { IndexedDBModule } from "/components/autoSaveIndexedDB.js";
const verctor_db_config = {
  database_name: "verctor_db",
  store_name: "missions",
  store_key: "mission",
};
const verctordbModule = new IndexedDBModule(
  verctor_db_config.database_name,
  verctor_db_config.store_name,
);

const ELEMENTS = {
  collectionSelect: document.getElementById("collectionSelect"),
  newCollectionBtn: document.getElementById("newCollectionBtn"),
  newCollectionInput: document.getElementById("newCollectionInput"),
  delCollectionBtn: document.getElementById("delCollectionBtn"),
  emptyCollectionBtn: document.getElementById("emptyCollectionBtn"),
  collectionDetails: document.getElementById("collectionDetails"),
  newCollectionGroup: document.querySelector(".newCollectionGroup"),
  ollamaModelSelect: document.getElementById("ollamaModelSelect"),
  chromaRegexSelect: document.getElementById("chroma-regex-list"),
  newRegexGroup: document.querySelector(".new-regex-group"),
  chromaRegexInput: document.getElementById("custom-chroma-regex"),
  progressBarText: document.getElementById("progressBarText"),
  progressBar: document.getElementById("progressBar"),
  addMetadataBtn: document.getElementById("add-metadata-btn"),
  missionProgress: document.getElementById("mission-progress"),
  Status: {
    chroma: document.getElementById("chroma-v"),
    ollama: document.getElementById("ollama-v"),
  },
};

const chroma_regexes = [["sentence", "\\.|。|\\?|？！|\\!"]];
export function removeMetaItem(_key = "") {
  const _group = document.querySelector(".metadata-group");
  _group.children.length === 1 && _group.classList.add("left-border");
  const item = _group.querySelector(`.item[key="${_key}"]`);
  item.remove();
}
export function addMetaItem(_key = "", _value = "") {
  const _group = document.querySelector(".metadata-group");
  if (_group.children.length === 1) _group.classList.add("left-border");
  const item = document.createElement("div");
  item.classList.add("item", "row", "metadata");
  item.setAttribute("key", _key);
  item.innerHTML = `<label style="text-indent:20px;">键 - 值</label>
                    <div style="display: flex;">
                        <input  type="text"  placeholder="key" value="${_key}"></input>
                        <input type="text"  placeholder="value"  value="${_value}" ></input>
                    </div>
                    <button style="margin-left: 10px;display:none;" name="del">-</button>
    `;
  _group.appendChild(item);
}

async function attachEvent() {
  ELEMENTS.collectionSelect.addEventListener("change", async (event) => {
    if (event.target.value === "newCollection") {
      ELEMENTS.newCollectionGroup.style.display = "block";

      ELEMENTS.delCollectionBtn.style.display = "none";
      ELEMENTS.emptyCollectionBtn.style.display = "none";
    } else {
      ELEMENTS.newCollectionGroup.style.display = "none";
      ELEMENTS.delCollectionBtn.style.display = "block";
      ELEMENTS.emptyCollectionBtn.style.display = "block";
      const selected = ELEMENTS.collectionSelect.querySelector(
        `[value="${ELEMENTS.collectionSelect.value}"]`,
      );
      const model = selected.getAttribute("data-model");
      const id = selected.id;
      if (model) {
        ELEMENTS.ollamaModelSelect.value = model;
      }
      await showCollectionDatas(id);
    }
  });

  ELEMENTS.newCollectionBtn.addEventListener("click", async (event) => {
    const name = ELEMENTS.newCollectionInput.value;
    if (name) {
      await api.createCollection(name);
      alert("Collection created successfully");
      ELEMENTS.newCollectionInput.value = ""; // 清空输入框
      render();
    } else {
      alert("Please enter a collection name");
    }
  });

  ELEMENTS.chromaRegexSelect.addEventListener("change", function (e) {
    if (ELEMENTS.chromaRegexSelect.value === "custom") {
      ELEMENTS.newRegexGroup.style.display = "block";
    } else {
      ELEMENTS.newRegexGroup.style.display = "none";
    }
  });
  ELEMENTS.delCollectionBtn.addEventListener("click", async (event) => {
    const name = ELEMENTS.collectionSelect.value;
    const id = ELEMENTS.collectionSelect.querySelector(
      `option[value="${name}"]`,
    );
    await api.deleteCollection(ELEMENTS.collectionSelect.value);
    verctordbModule.removeData([id]).catch((err) => conso.remle.error(err));
    alert("Collection deleted successfully");
    render();
  });
  ELEMENTS.emptyCollectionBtn.addEventListener("click", async (event) => {
    const id = ELEMENTS.collectionSelect.querySelector(
      `[value="${ELEMENTS.collectionSelect.value}"]`,
    ).id;

    const tr = document.querySelector("#data-table tbody tr");
    if (!tr || !tr.lastChild.textContent) return;
    await api.delWithCondition(id, {
      where: JSON.parse(tr.lastChild.textContent),
    });
    alert("Collection deleted successfully");
    render();
  });

  document
    .querySelector(".metadata-group")
    .addEventListener("click", async (e) => {
      if (e.target.tagName === "BUTTON" && e.target.name === "new") {
        addMetaItem();
      }
      if (e.target.tagName === "BUTTON" && e.target.name === "del") {
        const _group = document.querySelector(".metadata-group");
        if (_group.children.length === 1)
          _group.classList.remove("left-border");
        e.target.parentElement.remove();
      }
    });
}

// Function to create and populate the table
function populateTable(data, count) {
  const dataCount = document.getElementById("data-count");
  const tableBody = document.querySelector("#data-table tbody");
  const ids = data.ids || [];
  const documents = data.documents || [];
  const metadatas = data.metadatas || [];

  if (count) {
    dataCount.textContent =
      "共有" + count + "条数据，仅展示" + ids.length + "条。";
  } else {
    dataCount.innerHTML = "";
  }

  // Clear any existing rows
  tableBody.innerHTML = "";

  // Create rows for each item
  for (let i = 0; i < ids.length; i++) {
    const row = document.createElement("tr");

    const cellId = document.createElement("td");
    cellId.classList.add("id");
    cellId.textContent = ids[i] || "N/A";
    row.setAttribute("data-id", ids[i]);
    row.appendChild(cellId);

    const cellDocument = document.createElement("td");
    cellDocument.classList.add("document");
    cellDocument.textContent = documents[i] || "N/A";
    row.appendChild(cellDocument);

    const cellMetadata = document.createElement("td");
    cellMetadata.classList.add("metadata");
    cellMetadata.textContent = JSON.stringify(metadatas[i]) || "N/A";
    row.appendChild(cellMetadata);

    tableBody.appendChild(row);
  }
}

async function showCollectionDatas(id) {
  try {
    const collection = await api.queryDatas(id);
    const count = await api.countEmbeddings(id);
    populateTable(collection, count);
  } catch (error) {
    console.error("Error showing collection details:", error);
    alert("Error showing collection details");
  }
}

// 获取collection列表
async function listCollections() {
  const missions = await verctordbModule.getAllData();
  try {
    const collections = await api.listCollections();
    const htmls = collections
      .map((coll) => {
        const mission = missions?.find((item) => item.collectionId === coll.id);
        return `<option data-model="${mission ? mission.ollamaModel : ""}" id="${coll.id}" value="${coll.name}">${coll.name} </option>`;
      })
      .join("");
    ELEMENTS.collectionSelect.innerHTML =
      htmls +
      `<option id="newCollection" value="newCollection">新建集合</option>`;
  } catch (error) {
    console.error("Error listing collections:", error);
    alert("Error listing collections");
  }
  renderCollectSelect();
}
async function listEmbeddingsModels() {
  try {
    const modelNames = await api.listOllamaModelNames();
    ELEMENTS.ollamaModelSelect.innerHTML = modelNames
      .map((name) => `<option id="${name}" value="${name}">${name}</option>`)
      .join("");
  } catch (error) {
    console.error("Error listing ollama models:", error);
    alert("Error listing ollama models");
  }
}

function regex_select_init() {
  if (ELEMENTS.chromaRegexSelect.childElementCount > 0) return;
  const custom_option = document.createElement("option");
  custom_option.value = "custom";
  custom_option.textContent = "自定义";
  chroma_regexes.forEach((regex) => {
    const option = document.createElement("option");
    option.value = regex[1];
    option.textContent = regex[0];
    ELEMENTS.chromaRegexSelect.appendChild(option);
  });
  ELEMENTS.chromaRegexSelect.appendChild(custom_option);
  if (ELEMENTS.chromaRegexSelect.value === "custom") {
    ELEMENTS.newRegexGroup.style.display = "block";
  } else {
    ELEMENTS.newRegexGroup.style.display = "none";
  }
}

function renderCollectSelect() {
  const collect_select = document.getElementById("collectionSelect");
  if (collect_select.value !== "newCollection") {
    ELEMENTS.newCollectionGroup.style.display = "none";
    ELEMENTS.delCollectionBtn.style.display = "block";
    ELEMENTS.emptyCollectionBtn.style.display = "block";
  } else {
    ELEMENTS.newCollectionGroup.style.display = "block";
    ELEMENTS.delCollectionBtn.style.display = "none";
    ELEMENTS.emptyCollectionBtn.style.display = "none";
  }
}

export async function render() {
  regex_select_init();
  api.getVersion().then(async (version) => {
    const collectionName = ELEMENTS.collectionSelect.value;
    if (collectionName !== "newCollection") {
      const id = ELEMENTS.collectionSelect.querySelector(
        `[value="${collectionName}"]`,
      ).id;
      await showCollectionDatas(id);
    }
    await listEmbeddingsModels();
    await listCollections();
  });
}

export async function setStatus() {
  ELEMENTS.Status.chroma.classList.add("offline");
  ELEMENTS.Status.ollama.textContent = "ollama stopped";
  ELEMENTS.Status.ollama.classList.add("offline");

  api.listOllamaModelNames().then((isonline) => {
    if (isonline) {
      ELEMENTS.Status.ollama.classList.add("online");
      ELEMENTS.Status.ollama.textContent = "ollama running";
    } else {
      alert("请启动ollama服务！");
    }
  });
  api
    .getVersion()
    .then((version) => {
      ELEMENTS.Status.chroma.textContent = "chroma version：" + version;
      ELEMENTS.Status.chroma.classList.add("online");
    })
    .catch((err) => {
      alert("请启动chroma服务！");
    });
  await render();
  attachEvent();
}

export const getChromaRegex = () => {
  if (ELEMENTS.chromaRegexSelect.value == "custom") {
    return new RegExp(ELEMENTS.chromaRegexInput.value, "g");
  } else {
    return new RegExp(ELEMENTS.chromaRegexSelect.value, "g");
  }
};

export const getColloctionId = () => {
  return ELEMENTS.collectionSelect.querySelector(
    '[value="' + ELEMENTS.collectionSelect.value + '"]',
  ).id;
};
export const getEmbeddingModel = () => {
  return ELEMENTS.ollamaModelSelect.value;
};
// {
//     fileName: fileNameLabel.textContent,
//     chapters: chapters,
//     getChapterText: (dataIndex)=>getChapterText(dataIndex),
//     regex: getChromaRegex(),
//     collectionId: getColloctionId(),
//     ollamaModel: getEmbeddingModel()
// }
export function setFileMetadata(key, value) {
  const inputs = document
    .querySelector(".metadata-group .metadata")
    .querySelectorAll("input");
  inputs[0].value = key;
  inputs[1].value = value;
}

export function getMetadata() {
  const metadata = {};
  document
    .querySelector(".metadata-group")
    ?.querySelectorAll(".metadata")
    .forEach((element) => {
      const inputs = element.querySelectorAll("input");
      if (
        inputs.length !== 2 ||
        inputs[0].value === "" ||
        inputs[1].value === ""
      )
        return;
      const key = inputs[0].value;
      const value = inputs[1].value;
      metadata[key] = value;
    });
  return metadata;
}

function saveMissionEmbedModelName() {}

function setProgressBar(value) {
  console.log(typeof value);
  if (typeof value !== "number") return;
  ELEMENTS.progressBarText.textContent = ` ${value}%`;
  ELEMENTS.progressBar.style.width = value + "%";

  if (value >= 0 && ELEMENTS.missionProgress.style.display == "none") {
    ELEMENTS.missionProgress.style.display = "block";
  } else if (value == 100) {
    setTimeout(() => {
      ELEMENTS.missionProgress.style.display = "none";
      ELEMENTS.progressBarText.textContent = "";
      ELEMENTS.progressBar.style.width = "0%";
    }, 1000);
  }
}

const DELAY_BETWEEN_REQUESTS = 200; // 请求之间的延迟（毫秒）

function checkStoreConfig(config = {}) {
  const { fileName, chapterIds, collectionId, ollamaModel, regex } = config;

  const isInvalidFileName = !fileName || fileName === "请上传文件";
  const isEmptyChapterIds =
    Array.isArray(chapterIds) && chapterIds.length === 0;
  const isEmptyCollectionId = !collectionId; // 检查 collectionId
  const isEmptyOllamaModel = !ollamaModel;
  const isEmptyRegex = !regex;

  // if ([isInvalidFileName, isEmptyChapterIds, isEmptyCollectionId, isEmptyOllamaModel, isEmptyRegex].some(Boolean)) {
  //     alert("请检查输入信息！");
  //     return false;
  // } else {
  //     return true;
  // }
  if (isInvalidFileName) {
    console.log(config);
    alert("文件名无效，请检查输入的文件名！");
    return false;
  }
  if (isEmptyChapterIds) {
    alert("章节 ID 不能为空，请检查输入的章节 ID！");
    return false;
  }
  if (isEmptyCollectionId) {
    alert("集合 ID 不能为空，请检查输入的集合 ID！");
    return false;
  }
  if (isEmptyOllamaModel) {
    alert("Ollama 模型不能为空，请检查输入的 Ollama 模型！");
    return false;
  }
  if (isEmptyRegex) {
    alert("正则表达式不能为空，请检查输入的正则表达式！");
    return false;
  }

  // 如果所有条件都满足
  return true;
}

export const store = async (config) => {
  const isConfigOK = checkStoreConfig(config);
  if (!isConfigOK) return;
  let totalTasks = config.chapterIds.length;
  const isPostgres = config.postgreCheck;
  if (isPostgres) {
    totalTasks = config.postgreDataLength;
  }
  let completedTasks = 0;

  const worker = new Worker("worker.js");
  const _metadata = getMetadata();
  setProgressBar(0);

  worker.onmessage = async (event) => {
    const { options } = event.data;
    try {
      const result = await processTask(options);
      completedTasks++;
      setProgressBar(Number(((completedTasks / totalTasks) * 100).toFixed(2)));
    } catch (error) {
      console.error(`Error processing task: ${error.message}`);
    }

    if (completedTasks === totalTasks) {
      console.log("All tasks completed");
      worker.terminate(); // 终止 Worker
    }
  };

  const processTask = async (options) => {
    return await api.parseAndAddText(options);
  };
  const processTask_postgres = async (options, batchSize, count_callback) => {
    const sentences = options.sentences;
    for (let i = 0; i < sentences.length; i += batchSize) {
      const batch = sentences.slice(i, i + batchSize);
      options["sentences"] = batch;
      await api.batchAdd(options);
      count_callback();
    }
    return true;
  };

  if (isPostgres) {
    if (isPostgres) {
      let options = {
        sentences: config.postgreData,
        id: config.collectionId,
        metadata: _metadata,
        embedModel: config.ollamaModel,
      };

      // 发送任务到 Worker
      await new Promise((resolve) => {
        worker.onmessage = async (event) => {
          const { options } = event.data;
          try {
            await processTask_postgres(options, 50, () => {
              completedTasks += 50;
              setProgressBar(
                Number(((completedTasks / totalTasks) * 100).toFixed(2)),
              );
            });
          } catch (error) {
            console.error(`Error processing task: ${error.message}`);
          }
          resolve(); // 任务完成后解析 Promise
        };
        worker.postMessage({ options });
      });

      // 请求之间的延迟
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_REQUESTS),
      );
    }
  } else {
    // 处理每个任务
    for (let i = 0; i < totalTasks; i++) {
      const chapter = config.getChapterText(config.chapterIds[i]);
      let options = {
        text: chapter.content,
        id: config.collectionId,
        metadata: _metadata,
        embedModel: config.ollamaModel,
        splitRegexString: config.regex,
      };

      // 发送任务到 Worker
      await new Promise((resolve) => {
        worker.onmessage = async (event) => {
          const { options } = event.data;
          try {
            await processTask(options);
            completedTasks++;
            setProgressBar(
              Number(((completedTasks / totalTasks) * 100).toFixed(2)),
            );
          } catch (error) {
            console.error(`Error processing task: ${error.message}`);
          }
          resolve(); // 任务完成后解析 Promise
        };
        worker.postMessage({ options });
      });

      // 请求之间的延迟
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_REQUESTS),
      );
    }
  }

  worker.terminate(); // 终止 Worker
  return {
    collectionName: collectionSelect.value,
    collectionId: config.collectionId,
    ollamaModel: config.ollamaModel,
  };
};

export async function init_right() {
  await render();
  const _collectionSelect = document.getElementById("collectionSelect");
  if (_collectionSelect.value && _collectionSelect.value !== "newCollection") {
    showCollectionDatas(_collectionSelect.id);
  }
  setStatus();
}
