// worker.js
self.onmessage = (event) => {
    const { options } = event.data;
    self.postMessage({ options }); // 将选项发送回主线程
};
