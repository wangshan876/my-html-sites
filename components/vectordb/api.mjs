// api.js
export const CHROMA_BASE_URL = 'http://localhost:8000';
export const OLLAMA_BASE_URL = 'http://localhost:11434';

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response && !response.ok) {
        const error = await response.json();
        throw new Error(error.error || response.statusText);
    } 
    return response?.json();
}

// 根接口
export async function getRoot() {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1`);
}

// 重置接口
export async function reset() {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/reset`, {
        method: 'POST'
    });
}

// 版本接口
export async function getVersion() {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/version`);
}

// 心跳接口
export async function heartbeat() {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/heartbeat`);
}

// 预检查接口
export async function preFlightChecks() {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/pre-flight-checks`);
}

// 数据库管理
export async function createDatabase(database_name,tenant = 'default_tenant') {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {tenant,name: database_name} )
    });
}

export async function getDatabase(database, tenant = 'default_tenant') {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/databases/${database}?tenant=${tenant}`);
}

// 租户管理
export async function createTenant(requestBody) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
}

export async function getTenant(tenant) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/tenants/${tenant}`);
}

// 集合管理
export async function listCollections({ limit=30, offset=0, tenant = 'default_tenant', database = 'default_database' } = {}) {
    const query = new URLSearchParams({ limit, offset, tenant, database }).toString();
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections?${query}`);
}

export async function createCollection(name, tenant = 'default_tenant', database = 'default_database') {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tenant, database })
    });
}

export async function countCollections(tenant = 'default_tenant', database = 'default_database') {
    const query = new URLSearchParams({ tenant, database }).toString();
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/count_collections?${query}`);
}

export async function addToCollection(collectionId, embeddings, documents, ids) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeddings, documents, ids })
    });
}

export async function updateEmbedding(collectionId, requestBody) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
}

export async function upsertEmbedding(collectionId, requestBody) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
}

export async function getEmbedding(collectionId, requestBody) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
}
// {
//     "ids": [
//       "string"
//     ],
//     "where": {},
//     "where_document": {}
//   }
export async function delWithCondition(collectionId, requestBody={where:{},where_document:{}}) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
}

export async function countEmbeddings(collectionId) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/count`);
}


// {
//     "ids": [
//       "string"
//     ],
//     "where": {},
//     "where_document": {},
//     "sort": "string",
//     "limit": 0,
//     "offset": 0,
//     "include": [
//       "metadatas",
//       "documents"
//     ]
//   }
export async function queryDatas(id,options={limit:100}){
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${id}/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
    });
}

// {
//     "where": { //用于指定查询条件，以过滤集合中的数据。where 对象的每个键值对代表一个字段和对应的匹配条件。
//       "category": "technology"
//     },
//     "where_document": { //：用于指定更详细的文档过滤条件。如果 where 不够精确，可以使用where_document 来进一步过滤。
//       "title": {
//         "$contains": "AI"
//       }
//     },
//     "query_embeddings": [ //：包含一个或多个要查询的嵌入向量（embedding）。这些嵌入向量用于计算与集合中嵌入的相似度
//       "embedding_for_query"
//     ],
//     "n_results": 5,
//     "include": [
            // "metadatas"：包括文档的元数据。
            // "documents"：包括实际的文档内容。
            // "distances"：包括查询嵌入与集合中嵌入的距离（相似度）。
//     ]
//   }
export async function queryCollection(collectionId, queryText, body={},embedModel= 'all-minilm:l6-v2') {
    const embedResult = await fetchJson(`${OLLAMA_BASE_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: embedModel, input: queryText })
    });
    const queryEmbedding = embedResult.embeddings[0];
    body["query_embeddings"] = [queryEmbedding];
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${collectionId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}
export async function getCollectionDetails(name) {
    return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${name}`);
}
export async function deleteCollection(name,tenant="default_tenant",database="default_database") {
    const response = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${name}?tenant=${tenant}&database=${database}`, { method: 'DELETE' });
    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || response.statusText);
    }
}
// Function to split text into sentences
export function splitTextIntoSentences(text, splitRegexString) {
    if (!text) {
        return [];
    }
    const splitRegex = new RegExp(splitRegexString, 'g');
    return text.split(splitRegex).filter(sentence => {
        const trimmedSentence = sentence.trim();
        return trimmedSentence.length >= 4 && !/[\w\s，。！？“”‘’《》]+$/.test(trimmedSentence);
    });
}

// Function to parse text, split into chunks, and add to collection
export async function batchAdd(options) {
    
    const { sentences, id, metadata, documents, embedModel } = options;
    if (!sentences || !id) {
        alert('Please enter both sentence and target collection ID');
        return;
    }
    try {
        const embeddingsPromises = sentences.map(s =>
            fetchJson(`${OLLAMA_BASE_URL}/api/embed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: embedModel, input: s })
            })
        );

        const embeddingsResults = await Promise.all(embeddingsPromises);
        const embeddings = embeddingsResults.map(result => result.embeddings[0]);
        const ids = sentences.map((_, index) => `sentence_${crypto.randomUUID()}_${index}`);
        
        const _metadatas = new Array(ids.length).fill(metadata);
        return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${id}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "embeddings": embeddings,
                "documents": sentences,
                "metadatas": _metadatas,
                "ids": ids
            })
        });

    } catch (error) {
        return { result: false, error: error };
    }
}
// Function to parse text, split into chunks, and add to collection
export async function parseAndAddText(options) {
    const { text, id, metadata, documents, embedModel, splitRegexString } = options;
    if (!text || !id) {
        alert('Please enter both text and target collection ID');
        return;
    }
    try {
        const splitRegex = new RegExp(splitRegexString,'g');
        const sentences = text.split(splitRegex)
        .filter(sentence => {
            const trimmedSentence = sentence.trim();
            return  trimmedSentence.length >= 4 && !/[\w\s，。！？“”‘’《》]+$/.test(trimmedSentence);
        });
        const embeddingsPromises = sentences.map(sentence =>
            fetchJson(`${OLLAMA_BASE_URL}/api/embed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: embedModel, input: sentence })
            })
        );
    
        const embeddingsResults = await Promise.all(embeddingsPromises);
        const embeddings = embeddingsResults.map(result => result.embeddings[0]);
        const ids = sentences.map((_, index) => `sentence_${crypto.randomUUID()}_${index}`);
        
        const _metadatas = new Array(ids.length).fill(metadata);
        return fetchJson(`${CHROMA_BASE_URL}/api/v1/collections/${id}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "embeddings":embeddings,
                "documents":sentences,
                "metadatas":  _metadatas,
                "ids": ids
              })
        });

    } catch (error) {
        return { result: false, error: error };
    }
}
export async function listOllamaModelNames() {
    const data = await fetchJson(`${OLLAMA_BASE_URL}/api/tags`) ;
    return data.models
    .filter(model => model.details.families.some(family => family.toLowerCase().includes('bert')))
    .map(model => model.name);
}

