// 使用 Fetch API 发送 POST 请求
export async function executeCommand(command) {
    if(!command) return;
    const apiUrl = '/api/execute';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command }), // 将命令作为 JSON 数据传递
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.text();
    } catch (error) {
        console.error('Error executing command:', error);
    }
}

function getCommand(){ // 假设这里是从用户输入或其他地方获取命令
    


}
