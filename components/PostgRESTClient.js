export default class PostgRESTClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    // 检测 PostgreSQL 数据库状态
    async checkStatus() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // 如果响应状态不是 200，返回 false
            if (!response.ok) {
                return false;
            }

            // 解析 JSON 响应
            const data = await response.json();

            // 检查返回的数据是否为 [{"status":"OK"}]
            if (Array.isArray(data) && data.length === 1 && data[0].status === "OK") {
                return true; // 如果数据库在线，返回 true
            } else {
                return false; // 如果返回值不符合预期，返回 false
            }
        } catch (error) {
            console.error('Error checking database status:', error);
            return false; // 如果发生错误，返回 false
        }
    }

    // 创建记录
    async createRecord(tableName, data) {
        const response = await fetch(`${this.baseURL}/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response?.ok;
    }

    // 获取所有记录
    async getAllRecords(tableName) {
        const response = await fetch(`${this.baseURL}/${tableName}`);
        return response.json();
    }

    // 根据 ID 获取记录
    async getRecordById(tableName, id) {
        const response = await fetch(`${this.baseURL}/${tableName}?id=eq.${id}`);
        return response.json();
    }
    // 根据 keyword 获取记录
    async getRecordByKey(tableName, key, value) {
        const response = await fetch(`${this.baseURL}/${tableName}?${key}=eq.${value}`);
        return response.json();
    }
    async isEmpty(tableName, key, value) {

        const response = await fetch(`${this.baseURL}/${tableName}?limit=1&${key}=eq.${value}`);
        const data = await response.json()
        console.log(data)
        if (data.length == 0) {
            return true
        } else {
            return false
        }
    }


    // 更新记录
    async updateRecord(tableName, id, data) {
        const response = await fetch(`${this.baseURL}/${tableName}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    // 删除记录
    async deleteRecord(tableName, id) {
        const response = await fetch(`${this.baseURL}/${tableName}?id=eq.${id}`, {
            method: 'DELETE',
        });
        return response.json();
    }

    // 根据 JSON 字段条件查询
    async queryByJsonField(tableName, jsonField, value) {
        const response = await fetch(`${this.baseURL}/${tableName}?${jsonField}->>value=eq.${value}`);
        return response.json();
    }

    async createMultipleRecords(tableName, recordsArray) {
        try {
            const response = await fetch(`${this.baseURL}/${tableName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordsArray),
            });

            // 检查响应状态
            if (!response.ok) {
                const errorText = await response.text(); // 获取错误信息
                console.error(`Error: ${response.status} ${response.statusText}`, errorText);
                return false; // 或者根据需要抛出错误
            }

            console.log('Response:', response);
            return true; // 或者根据需要返回其他信息
        } catch (error) {
            // 输出详细的错误信息
            console.error('Fetch error:', error);
            console.error('Check if the server is running and the URL is correct:', `${this.baseURL}/${tableName}`);
            return false; // 或者根据需要抛出错误
        }
    }


}

// 使用方式
// const db = new PostgRESTClient('http://localhost:5001');
// db.createRecord('sentences', { content: 'Hello World', of: { author: 'John' } }).then(console.log);
// db.getAllRecords('sentences').then(console.log);
// db.getRecordById('sentences', 1).then(console.log);
// db.updateRecord('sentences', 1, { content: 'Updated Sentence', of: { author: 'John' } }).then(console.log);
// db.deleteRecord('sentences', 1).then(console.log);
// db.queryByJsonField('sentences', 'of', 'author', 'John').then(console.log);
// db.createMultipleRecords('sentences', [{ content: 'Sentence 1', of: { author: 'John' } }, { content: 'Sentence 2', of: { author: 'Jane' } }]).then(console.log);