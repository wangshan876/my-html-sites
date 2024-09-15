
### 根接口

- **路径**: `/api/v1`
  - **GET**
    - **操作ID**: `root`
    - **总结**: 获取根
    - **响应**:
      - `200`: 成功响应，类型为 `object`，属性为 `integer` 类型的额外属性

### 重置接口

- **路径**: `/api/v1/reset`
  - **POST**
    - **操作ID**: `reset`
    - **总结**: 重置
    - **响应**:
      - `200`: 成功响应，类型为 `boolean`

### 版本接口

- **路径**: `/api/v1/version`
  - **GET**
    - **操作ID**: `version`
    - **总结**: 获取版本信息
    - **响应**:
      - `200`: 成功响应，类型为 `string`

### 心跳接口

- **路径**: `/api/v1/heartbeat`
  - **GET**
    - **操作ID**: `heartbeat`
    - **总结**: 心跳检测
    - **响应**:
      - `200`: 成功响应，类型为 `object`，属性为 `integer` 类型的额外属性

### 预检查接口

- **路径**: `/api/v1/pre-flight-checks`
  - **GET**
    - **操作ID**: `pre_flight_checks`
    - **总结**: 预检查
    - **响应**:
      - `200`: 成功响应，类型为 `object`

### 数据库管理

- **路径**: `/api/v1/databases`
  - **POST**
    - **操作ID**: `create_database`
    - **总结**: 创建数据库
    - **参数**: `tenant` (可选, 默认值 `default_tenant`)
    - **请求体**: 必须，`CreateDatabase` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/databases/{database}`
  - **GET**
    - **操作ID**: `get_database`
    - **总结**: 获取数据库
    - **参数**:
      - `database` (必需)
      - `tenant` (可选, 默认值 `default_tenant`)
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

### 租户管理

- **路径**: `/api/v1/tenants`
  - **POST**
    - **操作ID**: `create_tenant`
    - **总结**: 创建租户
    - **请求体**: 必须，`CreateTenant` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/tenants/{tenant}`
  - **GET**
    - **操作ID**: `get_tenant`
    - **总结**: 获取租户
    - **参数**:
      - `tenant` (必需)
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

### 集合管理

- **路径**: `/api/v1/collections`
  - **GET**
    - **操作ID**: `list_collections`
    - **总结**: 列出集合
    - **参数**:
      - `limit` (可选)
      - `offset` (可选)
      - `tenant` (可选, 默认值 `default_tenant`)
      - `database` (可选, 默认值 `default_database`)
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

  - **POST**
    - **操作ID**: `create_collection`
    - **总结**: 创建集合
    - **参数**:
      - `tenant` (可选, 默认值 `default_tenant`)
      - `database` (可选, 默认值 `default_database`)
    - **请求体**: 必须，`CreateCollection` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/count_collections`
  - **GET**
    - **操作ID**: `count_collections`
    - **总结**: 统计集合数量
    - **参数**:
      - `tenant` (可选, 默认值 `default_tenant`)
      - `database` (可选, 默认值 `default_database`)
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/collections/{collection_id}/add`
  - **POST**
    - **操作ID**: `add`
    - **总结**: 添加嵌入
    - **参数**:
      - `collection_id` (必需)
    - **请求体**: 必须，`AddEmbedding` 类型
    - **响应**:
      - `201`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/collections/{collection_id}/update`
  - **POST**
    - **操作ID**: `update`
    - **总结**: 更新嵌入
    - **参数**:
      - `collection_id` (必需)
    - **请求体**: 必须，`UpdateEmbedding` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/collections/{collection_id}/upsert`
  - **POST**
    - **操作ID**: `upsert`
    - **总结**: 插入或更新嵌入
    - **参数**:
      - `collection_id` (必需)
    - **请求体**: 必须，`AddEmbedding` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/collections/{collection_id}/get`
  - **POST**
    - **操作ID**: `get`
    - **总结**: 获取嵌入
    - **参数**:
      - `collection_id` (必需)
    - **请求体**: 必须，`GetEmbedding` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/collections/{collection_id}/delete`
  - **POST**
    - **操作ID**: `delete`
    - **总结**: 删除嵌入
    - **参数**:
      - `collection_id` (必需)
    - **请求体**: 必须，`DeleteEmbedding` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/collections/{collection_id}/count`
  - **GET**
    - **操作ID**: `count`
    - **总结**: 统计集合中的嵌入数量
    - **参数**:
      - `collection_id` (必需)
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`

- **路径**: `/api/v1/collections/{collection_id}/query`
  - **POST**
    - **操作ID**: `get_nearest_neighbors`
    - **总结**: 获取最近邻嵌入
    - **参数**:
      - `collection_id` (必需)
    - **请求体**: 必须，`QueryEmbedding` 类型
    - **响应**:
      - `200`: 成功响应，类型为 `object`
      - `422`: 验证错误，类型为 `HTTPValidationError`