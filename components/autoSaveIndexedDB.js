import localforage from "/components/localforage.js";
class IndexedDBModule {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.localforageInstance = localforage.createInstance({
      name: this.dbName,
      storeName: this.storeName,
    });
  }
  removeData(keys = []) {
    // 使用 Promise.all 来并行删除多个键
    return Promise.all(
      keys.map((key) => this.localforageInstance.removeItem(key)),
    )
      .then(() => {
        console.log("所有指定的键已成功删除");
      })
      .catch((err) => {
        console.error("删除过程中发生错误:", err);
      });
  }
  saveData(data, key = "data") {
    return this.localforageInstance.setItem(key, data);
  }
  // 获取所有数据的函数
  getAllData() {
    return this.localforageInstance
      .keys()
      .then((keys) => {
        const promises = keys.map((key) =>
          this.localforageInstance.getItem(key),
        );
        return Promise.all(promises);
      })
      .then((dataArray) => {
        return dataArray; // 返回所有数据
      })
      .catch((error) => {
        console.error("读取数据时出错:", error);
        throw error;
      });
  }

  handleSaveButtonClick(containerId) {
    const data = {};
    const container = document.getElementById(containerId);
    const inputs = container.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      if (input.type === "checkbox") {
        if (input.checked) {
          if (!data[input.name]) {
            data[input.name] = [];
          }
          data[input.name].push(input.value);
        }
      } else if (input.type === "radio") {
        if (input.checked) {
          data[input.name] = input.value;
        }
      } else if (input.tagName.toLowerCase() === "textarea") {
        data[input.id || input.name] = input.value;
      } else {
        data[input.id || input.name] = input.value;
      }
    });

    this.saveData(data).catch((error) => {
      console.error("保存数据时出错:", error);
    });
  }
  initializeFormFromStore(target, type = "element") {
    this.localforageInstance
      .iterate(function (value, key, iterationNumber) {
        // 此回调函数将对所有 key/value 键值对运行
        const target_type = typeof target;
        if (type == "element" && target_type == "string") {
          const container = document.getElementById(target);
          const element = container.querySelector(
            `[name="${key}"], [id="${key}"],[key="${key}"]`,
          );
          if (!element) return;
          if (element.type === "checkbox") {
            const checkbox = container.querySelector(
              `[name="${key}"][value="${value}"]`,
            );
            if (checkbox) {
              checkbox.checked = true;
            }
          } else if (element.type === "radio") {
            const radio = container.querySelector(
              `[name="${key}"][value="${data[key]}"]`,
            );
            if (radio) {
              radio.checked = true;
            }
          } else if (element.tagName.toLowerCase() === "textarea") {
            element.textContent = value;
          } else if (element.tagName.toLowerCase() === "select") {
            element.value = value;
          } else if (element.tagName.toLowerCase() === "input") {
            element.value = value;
          } else {
            element.value = value;
          }
        } else if (type === "callback" && target_type === "function") {
          target(key, value);
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  }
  initializeFormFromStoreByKey(target, data_key = "data", type = "element") {
    return this.localforageInstance
      .getItem(data_key)
      .then((data) => {
        if (!data) {
          return;
        }
        const target_type = typeof target;
        if (type == "element" && target_type == "string") {
          const container = document.getElementById(target);
          for (const key in data) {
            const element = container.querySelector(
              `[name="${key}"], [id="${key}"]`,
            );
            if (element) {
              if (element.type === "checkbox") {
                if (Array.isArray(data[key])) {
                  data[key].forEach((value) => {
                    const checkbox = container.querySelector(
                      `[name="${key}"][value="${value}"]`,
                    );
                    if (checkbox) {
                      checkbox.checked = true;
                    }
                  });
                }
              } else if (element.type === "radio") {
                const radio = container.querySelector(
                  `[name="${key}"][value="${data[key]}"]`,
                );
                if (radio) {
                  radio.checked = true;
                }
              } else if (element.tagName.toLowerCase() === "textarea") {
                element.textContent = data[key];
              } else {
                element.value = data[key];
              }
            }
          }
        } else if (type === "callback" && target_type === "function") {
          target(data);
        }
      })
      .catch((error) => {
        console.error("读取数据时出错:", error);
        throw error;
      });
  }
}

export { IndexedDBModule };
