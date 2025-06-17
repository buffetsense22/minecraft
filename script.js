
// Simplified for demo: movement, block placing, hotbar
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 40;
const rows = 15;
const cols = 24;

const BLOCKS = { AIR: 0, DIRT: 1, STONE: 2, GRASS: 3, SAND: 4 };
const blockColors = {
  0: "#87CEEB", 1: "#8B4513", 2: "#666", 3: "#228B22", 4: "#f4e99d"
};
let selectedBlock = 1;

let world = [];
function generateWorld() {
  for (let y = 0; y < rows; y++) {
    world[y] = [];
    for (let x = 0; x < cols; x++) {
      if (y > 11) world[y][x] = BLOCKS.STONE;
      else if (y === 11) world[y][x] = BLOCKS.DIRT;
      else if (y === 10) world[y][x] = BLOCKS.GRASS;
      else world[y][x] = BLOCKS.AIR;
    }
  }
}
function loadWorld() {
  const saved = localStorage.getItem("minecraft_world");
  if (saved) world = JSON.parse(saved);
  else generateWorld();
}
function saveWorld() {
  localStorage.setItem("minecraft_world", JSON.stringify(world));
}

let player = {
  x: 3, y: 9, vx: 0, vy: 0, width: 1, height: 1,
  color: "yellow", onGround: false
};

const keys = {};
window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (["1", "2", "3", "4"].includes(e.key)) {
    selectedBlock = parseInt(e.key);
    renderHotbar();
  }
});
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = Math.floor((e.clientX - rect.left) / tileSize);
  const my = Math.floor((e.clientY - rect.top) / tileSize);
  if (world[my] && world[my][mx] !== undefined) {
    world[my][mx] = world[my][mx] === BLOCKS.AIR ? selectedBlock : BLOCKS.AIR;
    saveWorld();
  }
});

function isSolid(x, y) {
  const bx = Math.floor(x);
  const by = Math.floor(y);
  return world[by]?.[bx] && world[by][bx] !== BLOCKS.AIR;
}

function updatePlayer() {
  const speed = 0.1, jumpPower = 0.35, gravity = 0.05;
  if (keys["a"]) player.vx = -speed;
  else if (keys["d"]) player.vx = speed;
  else player.vx = 0;

  if (keys["w"] && player.onGround) {
    player.vy = -jumpPower;
    player.onGround = false;
  }
  player.vy += gravity;

  player.x += player.vx;
  if (isSolid(player.x + 0.9, player.y) || isSolid(player.x, player.y)) {
    player.x -= player.vx;
  }

  player.y += player.vy;
  if (isSolid(player.x, player.y + 1) || isSolid(player.x + 0.9, player.y + 1)) {
    player.vy = 0;
    player.onGround = true;
    player.y = Math.floor(player.y);
  } else {
    player.onGround = false;
  }
}

function drawWorld() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = blockColors[world[y][x]] || "#000";
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x * tileSize, player.y * tileSize, tileSize, tileSize);
}

function renderHotbar() {
  const hotbar = document.getElementById("hotbar");
  hotbar.innerHTML = "";
  for (let i = 1; i <= 4; i++) {
    const slot = document.createElement("div");
    slot.className = "slot" + (i === selectedBlock ? " active" : "");
    slot.textContent = i;
    slot.style.backgroundColor = blockColors[i];
    hotbar.appendChild(slot);
  }
}

function gameLoop() {
  updatePlayer();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorld();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

loadWorld();
renderHotbar();
gameLoop();
