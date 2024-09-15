// fileProcessor.js
export default class FileProcessor {
    constructor(fileInputId,splitRegex, onChaptersReady) {
        this.fileInputId = fileInputId;
        this.chapters = [];
        this.splitRegex = splitRegex;
        this.onChaptersReady = onChaptersReady;
        this.fileName = "";
        this.fileSize = 0;
        this.fileType = "";
        this.init();
    }

    init() {
        const fileInput = document.getElementById(this.fileInputId);
        fileInput.addEventListener('change', this.handleFileChange.bind(this));
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        this.fileName = file.name;
        this.fileSize = file.size;
        this.fileType = file.type;
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            // 使用Web Worker处理大文件
            const worker = new Worker('/components/splitTextFile/worker.js');
            worker.postMessage({text,splitRegex:this.splitRegex});

            worker.onmessage = (event) => {
                this.chapters = event.data;
                if (typeof this.onChaptersReady === 'function') {
                    this.onChaptersReady(this.chapters);
                }
            };
        };

        reader.readAsText(file);
    }
}