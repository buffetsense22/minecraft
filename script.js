let state = {
  anger: 50,
  level: 1,
  timeLeft: 30,
  rate: 1,
  streak: 0,
  interval: null,
  history: [],
  cooldown: false,
  relaxing: false
};

const i = id => document.getElementById(id);
const t = key => translations[i("language").value][key];

function updateLang() {
  document.title = t("title");
  i("title").textContent = t("title");
  i("status").textContent = t("start");
  i("timer").textContent = t("time") + state.timeLeft;
  i("level").textContent = t("level") + state.level;
  i("highscore").textContent = t("highscore") + (localStorage.high || 0);
  i("restartBtn").textContent = t("restart");
}

function updateBar() {
  i("angerFill").style.width = state.anger + "%";
  if (state.anger >= 100) endGame(t("lose"));
  else if (state.anger <= 0) calmSuccess();
  else i("status").textContent = t("angry");
}

function clickTarget() {
  if ('vibrate' in navigator) navigator.vibrate([100]);
  i("clickSound").play();
  state.anger -= 5;
  if (state.anger < 0) state.anger = 0;
  state.history.push(state.anger);
  updateBar();
  updateChart();
}

function startGame() {
  state.interval = setInterval(() => {
    state.anger += state.rate;
    if (state.anger > 100) state.anger = 100;
    state.timeLeft--;
    i("timer").textContent = t("time") + state.timeLeft;
    updateBar();
    if (state.timeLeft <= 0) endGame(t("timeout"));
  }, 1000);
}

function endGame(msg) {
  clearInterval(state.interval);
  i("status").textContent = msg;
  if (state.level - 1 > (localStorage.high || 0)) {
    localStorage.high = state.level - 1;
  }
  i("highscore").textContent = t("highscore") + localStorage.high;
}

function calmSuccess() {
  clearInterval(state.interval);
  state.level++;
  state.streak++;
  i("status").textContent = t("next");
  setTimeout(() => {
    state.anger = 50;
    state.timeLeft = 30;
    state.rate += state.relaxing ? 0.2 : 0.5;
    startGame();
  }, 2000);
}

function restartGame() {
  clearInterval(state.interval);
  state.anger = 50;
  state.level = 1;
  state.streak = 0;
  state.rate = 1;
  state.timeLeft = 30;
  state.history = [];
  i("calmMusic").pause();
  i("streak").textContent = "";
  updateLang();
  updateBar();
  startGame();
}

function useTool(tool) {
  if (state.cooldown) return;
  switch (tool) {
    case 'breathe': state.anger -= 10; break;
    case 'music': i("calmMusic").play(); state.anger -= 8; break;
    case 'hug': state.anger -= 12; break;
  }
  if (state.anger < 0) state.anger = 0;
  updateBar();
  state.cooldown = true;
  setTimeout(() => state.cooldown = false, 5000);
}

function updateChart() {
  if (!window.chart) {
    const ctx = document.getElementById('angerChart').getContext('2d');
    window.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{ label: 'Anger Level', data: [], borderColor: 'red' }]
      },
      options: {
        scales: {
          x: { display: false },
          y: { min: 0, max: 100 }
        }
      }
    });
  }
  const chart = window.chart;
  chart.data.labels.push('');
  chart.data.datasets[0].data.push(state.anger);
  chart.update();
}

i("target").addEventListener("click", clickTarget);
i("target").addEventListener("touchstart", clickTarget);
i("language").addEventListener("change", updateLang);
i("relaxingMode").addEventListener("change", e => {
  state.relaxing = e.target.checked;
});

updateLang();
updateBar();
startGame();
