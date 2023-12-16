let transactions = [];
let filteredData = [];
const filters = {name: "", date: "", title: ""};
let sortBy = "date";
let sortDir = 1;
const itemsPerPage = 20;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", function () {
  fetch("records.json")
    .then((response) => response.json())
    .then((data) => {
      transactions = data;
      filteredData = [...transactions];
      renderTable();
    })
    .catch((error) => console.error("Error fetching data:", error));
});

function applyFilters() {
  filters.name = document.getElementById("filterName").value;
  filters.date = document.getElementById("filterDate").value;
  filters.title = document.getElementById("filterTitle").value;

  currentPage = 1;
  renderTable();
  updateURL();
}

function changeSortDirection() {
  const sortDirectionSelect = document.getElementById("sortDirection");
  sortDir = sortDirectionSelect.value === "asc" ? 1 : -1;
  renderTable();
  updateURL();
}

function sortTable(key) {
  if (sortBy === key) {
    sortDir *= -1;
  } else {
    sortBy = key;
    sortDir = 1;
  }
  renderTable();
  updateURL();
}

function renderTable() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  filteredData = transactions.filter(function (item) {
    return (
      (filters.name === "" ||
        item.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.date === "" || item.date === filters.date) &&
      (filters.title === "" ||
        item.title.toLowerCase().includes(filters.title.toLowerCase()))
    );
  });

  filteredData.sort(function (a, b) {
    const aValue = a[sortBy].toLowerCase();
    const bValue = b[sortBy].toLowerCase();
    return sortDir * aValue.localeCompare(bValue);
  });

  const paginatedData = filteredData.slice(start, end);

  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  paginatedData.forEach(function (item) {
    const row = tableBody.insertRow();

    const cellDate = row.insertCell(0);
    const cellName = row.insertCell(1);
    const cellTitle = row.insertCell(2);
    const cellField = row.insertCell(3);
    const cellOldValue = row.insertCell(4);
    const cellNewValue = row.insertCell(5);

    cellDate.innerHTML = item.date;
    cellName.innerHTML = item.name;
    cellTitle.innerHTML = item.title;
    cellField.innerHTML = item.field;
    cellOldValue.innerHTML = item.old_value;
    cellNewValue.innerHTML = item.new_value;
  });

  renderPagination();
  updateURL();
}

function renderPagination() {
  let ellipsisSpan;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevButton = createPaginationButton(
      "Previous",
      function () {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      },
      "bg-blue-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded",
      "mr-2"
  );
  pagination.appendChild(prevButton);

  const maxPagesToShow = 10;
  const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
  const startPage = Math.max(1, currentPage - halfMaxPagesToShow);
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (startPage > 1) {
    const firstPageButton = createPaginationButton(
        1,
        function () {
          currentPage = 1;
          renderTable();
        },
        1 === currentPage ? "bg-blue-500" : "border",
        "px-4",
        "py-2",
        "rounded",
        "mr-2",
        "cursor-pointer",
        "hover:bg-blue-500",
        "hover:text-white"
    );
    pagination.appendChild(firstPageButton);

    if (startPage > 2) {
      ellipsisSpan = document.createElement("span");
      ellipsisSpan.innerText = "...";
      ellipsisSpan.classList.add("mr-2");
      pagination.appendChild(ellipsisSpan);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = createPaginationButton(
        i,
        (function (page) {
          return function () {
            currentPage = page;
            renderTable();
          };
        })(i),
        i === currentPage ? "bg-blue-500" : "border",
        "px-4",
        "py-2",
        "rounded",
        "mr-2",
        "cursor-pointer",
        "hover:bg-blue-500",
        "hover:text-white"
    );
    pagination.appendChild(button);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      ellipsisSpan = document.createElement("span");
      ellipsisSpan.innerText = "...";
      ellipsisSpan.classList.add("mr-2");
      pagination.appendChild(ellipsisSpan);
    }

    const lastPageButton = createPaginationButton(
        totalPages,
        function () {
          currentPage = totalPages;
          renderTable();
        },
        totalPages === currentPage ? "bg-blue-500" : "border",
        "px-4",
        "py-2",
        "rounded",
        "mr-2",
        "cursor-pointer",
        "hover:bg-blue-500",
        "hover:text-white"
    );
    pagination.appendChild(lastPageButton);
  }

  const nextButton = createPaginationButton(
      "Next",
      function () {
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      },
      "bg-blue-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded"
  );
  pagination.appendChild(nextButton);
}

function createPaginationButton(text, onClick, ...classes) {
  const button = document.createElement("button");
  button.innerText = text;
  button.onclick = onClick;
  button.classList.add(...classes);
  return button;
}

function updateURL() {
  const queryString = `?name=${filters.name}&date=${filters.date}&title=${filters.title}&sort=${sortBy}&dir=${sortDir}&page=${currentPage}`;
  window.history.replaceState({}, "", queryString);
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  filters.name = urlParams.get("name") || "";
  filters.date = urlParams.get("date") || "";
  filters.title = urlParams.get("title") || "";
  sortBy = urlParams.get("sort") || "date";
  sortDir = parseInt(urlParams.get("dir")) || 1;
  currentPage = parseInt(urlParams.get("page")) || 1;

  fetch("records.json")
    .then((response) => response.json())
    .then((data) => {
      transactions = data;
      filteredData = [...transactions];
      renderTable();
    })
    .catch((error) => console.error("Error fetching data:", error));
});

function showAllData() {
  // Reset filters
  filters.name = "";
  filters.date = "";
  filters.title = "";

  // Reset sorting
  sortBy = "date";
  sortDir = 1;

  currentPage = 1;
  renderTable();
  updateURL();
}

document.addEventListener("DOMContentLoaded", function () {

  const urlParams = new URLSearchParams(window.location.search);
  filters.name = urlParams.get("name") || "";
  filters.date = urlParams.get("date") || "";
  filters.title = urlParams.get("title") || "";
  sortBy = urlParams.get("sort") || "date";
  sortDir = parseInt(urlParams.get("dir")) || 1;
  currentPage = parseInt(urlParams.get("page")) || 1;

  fetch("../db/transaction/records.json")
    .then((response) => response.json())
    .then((data) => {
      transactions = data;
      filteredData = [...transactions];
      renderTable();
    })
    .catch((error) => console.error("Error fetching data:", error));
});
