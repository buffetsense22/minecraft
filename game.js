const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player = {
  x: 100,
  y: 100,
  health: 100,
  food: 100,
  inventory: [],
  arrows: 5
};

let blocks = [];
let enemies = [];
let arrows = [];
let wave = 1;
let furnaceActive = false;
let furnaceInput = null;
let furnaceFuel = null;

const recipes = {
  wood: { fuel: 5 },
  ironOre: { result: "iron", fuelNeeded: 5 }
};

const items = ["wood", "stone", "ironOre", "apple"];

function drawPlayer() {
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, 20, 20);
}

function drawBlocks() {
  for (let b of blocks) {
    ctx.fillStyle = "brown";
    ctx.fillRect(b.x, b.y, 20, 20);
  }
}

function drawEnemies() {
  for (let e of enemies) {
    ctx.fillStyle = e.boss ? "purple" : "red";
    ctx.fillRect(e.x, e.y, 20, 20);
  }
}

function drawArrows() {
  ctx.fillStyle = "yellow";
  for (let a of arrows) {
    ctx.fillRect(a.x, a.y, 10, 2);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBlocks();
  drawEnemies();
  drawArrows();
}

function update() {
  arrows.forEach(a => a.x += 5);
  arrows = arrows.filter(a => a.x < canvas.width);

  enemies.forEach(e => {
    if (e.x < player.x) e.x += 1;
    else e.x -= 1;
    if (Math.abs(e.x - player.x) < 20 && Math.abs(e.y - player.y) < 20) {
      player.health -= e.boss ? 2 : 1;
    }
  });

  document.getElementById("health").style.width = player.health + "%";
  document.getElementById("food").style.width = player.food + "%";

  document.getElementById("waveInfo").innerText = `Wave: ${wave} | Enemies: ${enemies.length}`;
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function spawnBlock() {
  blocks.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
}

function spawnEnemy(boss = false) {
  enemies.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, boss });
}

function shootArrow() {
  if (player.arrows > 0) {
    arrows.push({ x: player.x + 10, y: player.y + 10 });
    player.arrows--;
  }
}

function spawnWave() {
  const count = wave * 2;
  for (let i = 0; i < count; i++) spawnEnemy();
  if (wave % 3 === 0) spawnEnemy(true); // boss
  wave++;
}

function saveGame() {
  localStorage.setItem("minecraftClone", JSON.stringify({ player, blocks }));
}

function loadGame() {
  const save = JSON.parse(localStorage.getItem("minecraftClone"));
  if (save) {
    player = save.player;
    blocks = save.blocks;
  }
}

function toggleMusic() {
  const bg = document.getElementById("bgMusic");
  if (bg.paused) bg.play();
  else bg.pause();
}

function toggleFurnace() {
  furnaceActive = !furnaceActive;
  document.getElementById("furnaceUI").classList.toggle("hidden", !furnaceActive);
  const input = document.getElementById("furnaceInput");
  const fuel = document.getElementById("furnaceFuel");
  input.innerHTML = "";
  fuel.innerHTML = "";
  player.inventory.forEach(item => {
    input.innerHTML += `<option value="${item}">${item}</option>`;
    fuel.innerHTML += `<option value="${item}">${item}</option>`;
  });
}

function closeFurnace() {
  furnaceActive = false;
  document.getElementById("furnaceUI").classList.add("hidden");
}

function smelt() {
  const input = document.getElementById("furnaceInput").value;
  const fuel = document.getElementById("furnaceFuel").value;
  const recipe = recipes[input];
  if (recipe && player.inventory.includes(fuel)) {
    player.inventory = player.inventory.filter(i => i !== input && i !== fuel);
    if (recipe.result) player.inventory.push(recipe.result);
    alert("Smelting complete!");
  } else {
    alert("Invalid smelt!");
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "w") player.y -= 10;
  if (e.key === "s") player.y += 10;
  if (e.key === "a") player.x -= 10;
  if (e.key === "d") player.x += 10;
  if (e.key === " ") {
    spawnBlock();
    document.getElementById("mineSound").play();
    const item = items[Math.floor(Math.random() * items.length)];
    player.inventory.push(item);
  }
});

spawnWave();
loop();
