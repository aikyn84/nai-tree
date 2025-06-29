const password = 'Kaada2428';

let treeData = {
  name: "Найман",
  children: [
    { name: "Бірінші бала" },
    { name: "Екінші бала" },
    { name: "Үшінші бала" },
    { name: "Төртінші бала" },
    { name: "Бесінші бала" },
    { name: "Алтыншы бала" },
    { name: "Жетінші бала" },
    { name: "Сегізінші бала" },
    { name: "Тоғызыншы бала" },
    { name: "Оныншы бала" }
  ]
};

function renderTree(container, node) {
  let div = document.createElement('div');
  div.className = 'node';
  div.textContent = node.name;
  container.appendChild(div);

  if (node.children && node.children.length > 0) {
    let childrenContainer = document.createElement('div');
    childrenContainer.className = 'children';
    node.children.forEach(child => {
      renderTree(childrenContainer, child);
    });
    container.appendChild(childrenContainer);
  }
}

document.getElementById('enterButton').onclick = () => {
  let input = prompt("Құпия сөзді енгізіңіз:");
  if (input === password) {
    alert("Кіру сәтті өтті!");
    document.getElementById('tree-container').innerHTML = '';
    renderTree(document.getElementById('tree-container'), treeData);
  } else {
    alert("Қате құпия сөз!");
  }
};