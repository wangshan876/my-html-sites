export function createTableManager(initialData = [], initialItemsPerPage = 5) {
    let currentPage = 1;
    let itemsPerPage = initialItemsPerPage; // 从构造参数初始化
    let sortColumn = null;
    let sortOrder = 'asc';
    let tableData = initialData; // 从构造参数初始化

    function getTableHeaders(data) {
        const headers = new Set();
        data.forEach(item => {
            Object.keys(item).forEach(key => headers.add(key));
        });
        return Array.from(headers);
    }

    function renderTable() {
        const headers = getTableHeaders(tableData);
        const thead = document.querySelector('#dataTable thead');
        thead.innerHTML = '';

        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.setAttribute('data-sort', header);
            th.addEventListener('click', () => sortTable(header));
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const sortedData = sortColumn ? tableData.slice().sort((a, b) => {
            return sortOrder === 'asc' 
                ? (a[sortColumn] > b[sortColumn] ? 1 : -1) 
                : (a[sortColumn] < b[sortColumn] ? 1 : -1);
        }) : tableData.slice();

        const paginatedData = sortedData.slice(start, end);
        const tbody = document.querySelector('#dataTable tbody');
        tbody.innerHTML = '';

        paginatedData.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = item[header] || '';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${Math.ceil(tableData.length / itemsPerPage)}`;
    }

    function sortTable(column) {
        if (sortColumn === column) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortOrder = 'asc';
        }
        renderTable(); // 重新渲染表格
    }

    function attachEventListeners() {
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--; // 向上翻一页
                renderTable();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(tableData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++; // 向下翻一页
                renderTable();
            }
        });
    }

    // 只在创建时添加事件监听器
    attachEventListeners();

    return {
        renderTable,
        setData: (data) => {
            tableData = data; // 设置新的数据
            currentPage = 1; // 重置到第一页
            renderTable(); // 重新渲染表格
        },
        setItemsPerPage: (newItemsPerPage) => {
            itemsPerPage = newItemsPerPage; // 设置每页显示的项目数
            currentPage = 1; // 重置到第一页
            renderTable(); // 重新渲染表格
        },
    };
}
