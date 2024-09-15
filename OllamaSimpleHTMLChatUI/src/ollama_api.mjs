// 从localStorage中获取host-address，如果不存在则设置为默认值


var ollama_host = localStorage.getItem("host-address");
if (!ollama_host){
    ollama_host = 'http://localhost:11434'
} else {
    document.getElementById("host-address").value = ollama_host;
}

// 设置host-address的函数
export function setHostAddress(){
    ollama_host = document.getElementById("host-address").value;
    localStorage.setItem("host-address", ollama_host);
    populateModels();
}

// 获取模型的函数
export async function getModels(){
    const response = await fetch(`${ollama_host}/api/tags`);
    const data = await response.json();
    return data;
}

// 发送POST请求的函数
export function postRequest(data, signal) {
    const URL = `${ollama_host}/api/generate`;
    return fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: signal
    });
}

// 处理服务器响应的函数

export async function getResponse(response, callback) {
    const reader = response.body.getReader();
    let partialLine = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        const textChunk = new TextDecoder().decode(value);
        const lines = (partialLine + textChunk).split('\n');
        partialLine = lines.pop();

        for (const line of lines) {
            if (line.trim() === '') continue;
            const parsedResponse = JSON.parse(line);
            callback(parsedResponse);
        }
    }

    if (partialLine.trim() !== '') {
        const parsedResponse = JSON.parse(partialLine);
        callback(parsedResponse);
    }
}
