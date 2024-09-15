const textArea = document.getElementById('text');
const speakButton = document.getElementById('speak');
const stopButton = document.getElementById('stop');
const saveButton = document.getElementById('save');
const audioElement = document.getElementById('audio');

let audioChunks = [];
let mediaRecorder;
let audioContext;
let gainNode;

speakButton.addEventListener('click', () => {
    console.log("开始朗读...");
    const utterance = new SpeechSynthesisUtterance(textArea.value);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0; // 调整音量
    const destination = audioContext.createMediaStreamDestination();
    mediaRecorder = new MediaRecorder(destination.stream, { mimeType: 'audio/webm' }); 

    mediaRecorder.ondataavailable = event => {
        console.log("录制到音频数据...", event.data.size);
        if (event.data.size > 0) {
            audioChunks.push(event.data);
            console.log("已录制 ", audioChunks.length, " 个音频块");
        } else {
            console.warn("没有录制到音频数据");
        }
    };

    mediaRecorder.onstop = () => {
        console.log("停止录制...");
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log("音频 Blob 大小:", audioBlob.size);
        if (audioBlob.size > 0) {
            const audioUrl = URL.createObjectURL(audioBlob);
            audioElement.src = audioUrl;
            audioElement.play(); // 尝试自动播放音频
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = '朗读音频.webm';
            a.click();
            // audioChunks = [];
            // URL.revokeObjectURL(audioUrl); // 释放 Blob URL
        } else {
            console.error("音频 Blob 大小为 0，无法播放");
        }
    };

    gainNode.connect(destination);
    mediaRecorder.start();
    console.log("开始录制音频...");

    utterance.onstart = () => {
        console.log("朗读开始...");
        if (destination.stream.active) {
            console.log("MediaStreamDestination 已连接");
            const source = audioContext.createMediaStreamSource(destination.stream);
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            console.log("音频源已连接到 GainNode");
        } else {
            console.error("MediaStreamDestination 未连接");
        }
    };

    speechSynthesis.speak(utterance);

    utterance.onend = () => {
        console.log("朗读结束...");
        mediaRecorder.stop();
        console.log("录制已停止");
    };
});

stopButton.addEventListener('click', () => {
    console.log("停止朗读...");
    speechSynthesis.cancel();
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
});

saveButton.addEventListener('click', () => {
    console.log("保存音频...");
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '朗读音频.webm';
    a.click();
    console.log("释放 Blob URL:", url);
    URL.revokeObjectURL(url);
});