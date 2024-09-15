const ELEMENTS = {
    collectionName: document.getElementById('collectionName'),
    collectionSelect: document.getElementById('collectionSelect'),
    collectionDetails: document.getElementById('collectionDetails'),
    textInput: document.getElementById('textInput'),
    queryText: document.getElementById('queryText'),
    parseResponse: document.getElementById('parseResponse'),
    queryResponse: document.getElementById('queryResponse'),
    deleteCollectionName: document.getElementById('deleteCollectionName'),
    deleteResponse: document.getElementById('deleteResponse'),
    collectionNameBtn: document.getElementById('collectionNameBtn'),
    collectionListBtn: document.getElementById('collectionListBtn'),
    collectionDetailsBtn: document.getElementById('collectionDetailsBtn'),
    parseResponseBtn: document.getElementById('parseResponseBtn'),
    queryResponseBtn: document.getElementById('queryResponseBtn'),
    deleteResponseBtn: document.getElementById('deleteResponseBtn'),
    databaseName: document.getElementById('databaseName'),
    createDatabaseBtn: document.getElementById('createDatabaseBtn'),
    createDatabaseResponse: document.getElementById('createDatabaseResponse'),
    listDatabasesBtn: document.getElementById('listDatabasesBtn'),
    listDatabasesResponse: document.getElementById('listDatabasesResponse'),
    tenantName: document.getElementById('tenantName'),
    createTenantBtn: document.getElementById('createTenantBtn'),
    createTenantResponse: document.getElementById('createTenantResponse'),
    updateCollectionBtn:document.getElementById('updateCollectionBtn'),
    updateCollectionName:document.getElementById('updateCollectionName'),
    updateCollectionResponse:document.getElementById('updateCollectionResponse')
};

import * as api from '/components/vectordb/api.mjs';

function getCurrentSelect() {
    return ELEMENTS.collectionSelect.querySelector(`[value=${ELEMENTS.collectionSelect.value}]`);
}

// 创建collection
ELEMENTS.collectionNameBtn.addEventListener('click', async () => {
    const name = ELEMENTS.collectionName.value;
    if (name) {
        await api.createCollection(name);
        alert('Collection created successfully');
        ELEMENTS.collectionName.value = ''; // 清空输入框
    } else {
        alert('Please enter a collection name');
    }
});

// 获取collection列表
ELEMENTS.collectionListBtn.addEventListener('click', async () => {
    try {
        const collections = await api.listCollections();
        ELEMENTS.collectionSelect.innerHTML = collections.map(coll =>
            `<option id="${coll.id}" value="${coll.id}">${coll.name}</option>`).join('');
    } catch (error) {
        console.error('Error listing collections:', error);
        alert('Error listing collections');
    }
});

// 获取collection详情
ELEMENTS.collectionDetailsBtn.addEventListener('click', async () => {
    const v = ELEMENTS.collectionSelect.value;
    const name = document.querySelector(`[value="${v}"]`).textContent
    if (name) {
        const content = await api.getCollectionDetails(name);
        ELEMENTS.collectionDetails.innerHTML = JSON.stringify(content);
    } else {
        alert('Please select a collection');
    }
});

// 解析并添加文本到collection
ELEMENTS.parseResponseBtn.addEventListener('click', async () => {
    const selectedId = ELEMENTS.collectionSelect.value;
    const response = await api.parseAndAddText(ELEMENTS.textInput.value, selectedId);
    ELEMENTS.parseResponse.innerHTML = response.result ? "解析成功" : response.error;
});

// 查询collection
ELEMENTS.queryResponseBtn.addEventListener('click', async () => {
    const selectedId = ELEMENTS.collectionSelect.value;
    const body = {
        n_results: 5,
        include: ["metadatas", "documents", "distances"]
    };
    const response = await api.queryCollection(selectedId, ELEMENTS.queryText.value, body);
    ELEMENTS.queryResponse.innerHTML = JSON.stringify(response);
});

// 删除collection
ELEMENTS.deleteResponseBtn.addEventListener('click', async () => {
    await api.deleteCollection(ELEMENTS.deleteCollectionName.value);
    ELEMENTS.collectionListBtn.click();
    alert('Collection deleted successfully');
});

// 创建数据库
ELEMENTS.createDatabaseBtn.addEventListener('click', async () => {
    const name = ELEMENTS.databaseName.value;
    if (name) {
        const response = await api.createDatabase(name );
        ELEMENTS.createDatabaseResponse.innerHTML = JSON.stringify(response);
        ELEMENTS.databaseName.value = ''; // 清空输入框
    } else {
        alert('Please enter a database name');
    }
});

// 列出数据库
ELEMENTS.listDatabasesBtn.addEventListener('click', async () => {
    try {
        const databases = await api.getDatabase();
        ELEMENTS.listDatabasesResponse.innerHTML = JSON.stringify(databases);
    } catch (error) {
        console.error('Error listing databases:', error);
        alert('Error listing databases');
    }
});

// 创建租户
ELEMENTS.createTenantBtn.addEventListener('click', async () => {
    const name = ELEMENTS.tenantName.value;
    if (name) {
        const response = await api.createTenant({ name });
        ELEMENTS.createTenantResponse.innerHTML = JSON.stringify(response);
        ELEMENTS.tenantName.value = ''; // 清空输入框
    } else {
        alert('Please enter a tenant name');
    }
});

// Update Collection
ELEMENTS.updateCollectionBtn.addEventListener('click', async () => {
    const selectedId = ELEMENTS.collectionSelect.value;
    const newName = ELEMENTS.updateCollectionName.value;
    if (selectedId && newName) {
        try {
            await api.updateCollection(selectedId, { name: newName });
            alert('Collection updated successfully');
            ELEMENTS.collectionListBtn.click();
            ELEMENTS.updateCollectionName.value = ''; // Clear input field
        } catch (error) {
            console.error('Error updating collection:', error);
            alert('Error updating collection');
        }
    } else {
        alert('Please select a collection and enter a new name');
    }
});
