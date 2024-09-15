const baseurl = "http://127.0.0.1:5001/";
let currentPage = 1;
let totalPages = 0;
const pageSize = 10; // 每页显示的记录数

document.getElementById("load-data").addEventListener("click", async () => {
  loadPage("sentences", currentPage);
});

document.getElementById("add-sentence").addEventListener("click", async () => {
  const newSentence = document.getElementById("new-sentence").value;
  if (!newSentence) {
    alert("请输入句子");
    return;
  }

  await fetch(`${baseurl}sentences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sentence: newSentence }), // 假设表中有一个字段叫 "sentence"
  });

  document.getElementById("new-sentence").value = ""; // 清空输入框
  loadPage("sentences", currentPage); // 重新加载数据
});

async function loadPage(tableName, page) {
  const countResponse = await fetch(`${baseurl}${tableName}?select=count`);
  const countData = await countResponse.json();
  const totalCount = countData[0].count;
  totalPages = Math.ceil(totalCount / pageSize);

  const response = await fetch(
    `${baseurl}${tableName}?limit=${pageSize}&offset=${(page - 1) * pageSize}`,
  );
  const data = await response.json();

  // 清空表头和表体
  document.getElementById("table-header").innerHTML = "";
  document.getElementById("table-body").innerHTML = "";

  if (data.length > 0) {
    // 动态生成表头
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      document.getElementById("table-header").appendChild(th);
    });
    const actionTh = document.createElement("th");
    actionTh.textContent = "操作";
    document.getElementById("table-header").appendChild(actionTh);

    // 动态生成表体
    data.forEach((row) => {
      const tr = document.createElement("tr");
      Object.values(row).forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });

      // 添加编辑和删除按钮
      const actionTd = document.createElement("td");
      const editButton = document.createElement("span");
      editButton.textContent = "编辑";
      editButton.className = "edit-button";
      editButton.addEventListener("click", () =>
        editSentence(row.id, row.sentence),
      ); // 假设表中有一个字段叫 "id"
      actionTd.appendChild(editButton);

      const deleteButton = document.createElement("span");
      deleteButton.textContent = "删除";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener("click", () => deleteSentence(row.id));
      actionTd.appendChild(deleteButton);

      tr.appendChild(actionTd);
      document.getElementById("table-body").appendChild(tr);
    });

    // 生成分页
    generatePagination();
  } else {
    alert("没有数据");
  }
}

function generatePagination() {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";

  // 上一页按钮
  const prevButton = document.createElement("span");
  prevButton.textContent = "上一页";
  prevButton.className = `pagination-button ${currentPage === 1 ? "disabled" : ""}`;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadPage("sentences", currentPage);
    }
  });
  paginationDiv.appendChild(prevButton);

  // 页码按钮
  const maxVisiblePages = 5; // 最多显示的页码数量
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement("span");
    pageLink.textContent = i;
    pageLink.className = "page-link";
    if (i === currentPage) {
      pageLink.style.fontWeight = "bold"; // 高亮当前页
    } else {
      pageLink.addEventListener("click", () => {
        currentPage = i;
        loadPage("sentences", currentPage);
      });
    }
    paginationDiv.appendChild(pageLink);
  }

  // 下一页按钮
  const nextButton = document.createElement("span");
  nextButton.textContent = "下一页";
  nextButton.className = `pagination-button ${currentPage === totalPages ? "disabled" : ""}`;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadPage("sentences", currentPage);
    }
  });
  paginationDiv.appendChild(nextButton);
}

async function editSentence(id, currentSentence) {
  const newSentence = prompt("编辑句子:", currentSentence);
  if (newSentence) {
    await fetch(`${baseurl}sentences?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sentence: newSentence }), // 假设表中有一个字段叫 "sentence"
    });
    loadPage("sentences", currentPage); // 重新加载数据
  }
}

async function deleteSentence(id) {
  if (confirm("确定要删除这条记录吗？")) {
    await fetch(`${baseurl}sentences?id=eq.${id}`, {
      method: "DELETE",
    });
    loadPage("sentences", currentPage); // 重新加载数据
  }
}
