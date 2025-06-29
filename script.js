const PASSWORD = "Kaada2428";
let isAdmin = false;
let treeData = {};
const treeContainer = document.getElementById("treeContainer");

// === Загрузка данных ===
async function loadData() {
  const res = await fetch('data/data.json');
  treeData = await res.json();
  treeContainer.innerHTML = "";
  renderTree(treeData, treeContainer);
}
loadData();

// === Авторизация ===
function checkPassword() {
  const input = document.getElementById("adminPassword").value;
  if (input === PASSWORD) {
    isAdmin = true;
    document.body.classList.add("admin");
    document.getElementById("saveBtn").style.display = "inline-block";
  } else {
    alert("Қате пароль");
  }
}

// === Рендер древа ===
function renderTree(data, container) {
  const personDiv = document.createElement("div");
  personDiv.className = "person tree-line";
  personDiv.innerHTML = `
    <span class="name">${data.name}</span>
    <span class="father" style="display:none">${data.father || ""}</span>
    <span class="admin-only">
      <button onclick="addChild(this)">➕</button>
      <button onclick="editPerson(this)">✏️</button>
      <button onclick="removePerson(this)">🗑️</button>
      <button onclick="toggleBold(this)">✳️</button>
    </span>
    <button onclick="toggleChildren(this)">▸</button>
  `;
  container.appendChild(personDiv);

  const childrenDiv = document.createElement("div");
  childrenDiv.className = "child-container hidden";
  container.appendChild(childrenDiv);

  personDiv.dataset.childrenDiv = childrenDiv;

  if (data.children && data.children.length > 0) {
    data.children.forEach(child => {
      renderTree(child, childrenDiv);
    });
  }

  personDiv.addEventListener("click", function (e) {
    if (!e.target.closest("button")) {
      document.querySelectorAll(".person").forEach(p => p.classList.remove("highlight"));
      personDiv.classList.add("highlight");
    }
  });
}

// === Раскрытие потомков ===
function toggleChildren(button) {
  const parent = button.parentElement;
  const childContainer = parent.nextElementSibling;
  childContainer.classList.toggle("hidden");
  button.textContent = childContainer.classList.contains("hidden") ? "▸" : "▾";
}

// === Добавление потомка ===
function addChild(button) {
  const parentDiv = button.closest(".person");
  const parentName = parentDiv.querySelector(".name").textContent;
  const childrenDiv = parentDiv.nextElementSibling;

  const newName = prompt("Есімі:");
  if (!newName) return;

  const newNode = {
    name: newName,
    father: parentName,
    children: []
  };

  const parentObj = findNode(treeData, parentName);
  if (parentObj) {
    parentObj.children = parentObj.children || [];
    parentObj.children.push(newNode);
    renderTree(treeData, treeContainer);
  }
}

// === Поиск узла по имени ===
function findNode(node, name) {
  if (node.name === name) return node;
  if (node.children) {
    for (let child of node.children) {
      const found = findNode(child, name);
      if (found) return found;
    }
  }
  return null;
}

// === Редактирование имени ===
function editPerson(button) {
  const person = button.closest(".person");
  const nameSpan = person.querySelector(".name");
  const newName = prompt("Жаңа есімі:", nameSpan.textContent);
  if (newName) {
    const node = findNode(treeData, nameSpan.textContent);
    if (node) {
      node.name = newName;
      renderTree(treeData, treeContainer);
    }
  }
}

// === Удаление потомка ===
function removePerson(button) {
  const person = button.closest(".person");
  const name = person.querySelector(".name").textContent;
  if (confirm(`"${name}" өшіру керек пе?`)) {
    treeData = deleteNode(treeData, name);
    renderTree(treeData, treeContainer);
  }
}

function deleteNode(node, name) {
  if (!node.children) return node;
  node.children = node.children.filter(child => child.name !== name)
    .map(child => deleteNode(child, name));
  return node;
}

// === Акцент (жирный текст) ===
function toggleBold(button) {
  const nameSpan = button.closest(".person").querySelector(".name");
  nameSpan.classList.toggle("bold-name");
}

// === Поиск по имени или отцу ===
function searchTree() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  let found = false;
  document.querySelectorAll(".person").forEach(p => {
    const name = p.querySelector(".name").textContent.toLowerCase();
    const father = p.querySelector(".father").textContent.toLowerCase();
    if (name.includes(query) || father.includes(query)) {
      p.classList.add("highlight");
      expandTo(p);
      found = true;
    } else {
      p.classList.remove("highlight");
    }
  });
  document.getElementById("searchResult").textContent = found ? "" : "Шежіреден табылмады";
}

// === Раскрыть всех родителей вверх по цепочке ===
function expandTo(element) {
  let current = element;
  while (current) {
    const children = current.dataset.childrenDiv;
    if (children) {
      children.classList.remove("hidden");
    }
    current = current.parentElement.closest(".child-container")?.previousElementSibling;
    if (current) {
      const btn = current.querySelector("button:last-child");
      if (btn) btn.textContent = "▾";
    }
  }
}

// === Сохранение в GitHub через Action ===
function saveData() {
  fetch('https://api.github.com/repos/АйкынСадыков/nai-tree/dispatches', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + 'ghp_ТВОЙ_ТОКЕН', // заменяется секретом GH_TOKEN в GitHub
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      event_type: 'update-tree',
      client_payload: {
        content: btoa(unescape(encodeURIComponent(JSON.stringify(treeData, null, 2))))
      }
    })
  })
  .then(r => {
    if (r.ok) {
      alert("Сақталды!");
    } else {
      alert("Қате! GitHub-қа жүктеу сәтсіз.");
      console.error(r);
    }
  });
}