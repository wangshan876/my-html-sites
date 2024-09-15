const url = 'https://sing-box-subscribe-xi-pearl.vercel.app/config/https:/jgjs2-connect.com/api/v1/client/subscribe?token=e33e5c744064e43f325dc873fb9a27e3'; // 替换为你的实际链接


// 使用 fetch 获取 JSON 数据
fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
      return response.json();  
    })
    .then(A => {
        // 第一步：找到 server_port 大于 65535 的数据 B
        let B = A.outbounds.filter(item => item.server_port > 65535);

        // 第二步：取得这些满足条件的 tag 键的值 C
        let C = B.map(item => item.tag);

        // 第三步：删除 A.outbounds 中 tag 是 "Proxy"、"Others" 和 "auto" 的项
        A.outbounds = A.outbounds.filter(item => {
            // 如果 tag 是 "Proxy"、"Others" 或 "auto"，则需要删除对应的 server_port
            if (["Proxy", "Others", "auto"].includes(item.tag)) {
                return !C.includes(item.tag);
            }
            return true;
        });

        // 第四步：删除 B
        B.forEach(item => {
            A.outbounds = A.outbounds.filter(outbound => outbound.server_port !== item.server_port);
        });

        // 输出结果并下载为文件
        downloadJSON(A, 'result.json');
    })
    .catch(error => {
        console.error('获取数据时出错:', error);
    });

// 下载 JSON 数据为文件的函数
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // 释放内存
}
