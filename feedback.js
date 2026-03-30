// feedback.js — reads results from localStorage and renders summary
const RESULTS_KEY = 'sq.results';

function getResults() {
  try { return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]'); }
  catch { return []; }
}

function sum(arr, sel) { return arr.reduce((a, r) => a + (sel ? sel(r) : r), 0); }

function renderDonut(correct, wrong) {
  const total = Math.max(1, correct + wrong);
  const pct = Math.round((correct / total) * 100);

  // Circle math: stroke-dasharray is percentage of circumference (100-based here)
  const cSeg = document.getElementById('donut-correct');
  const wSeg = document.getElementById('donut-wrong');
  const label = document.getElementById('donut-label');

  const cPct = (correct / total) * 100;
  const wPct = 100 - cPct;

  cSeg.setAttribute('stroke-dasharray', `${cPct} ${100 - cPct}`);
  wSeg.setAttribute('stroke-dasharray', `${wPct} ${100 - wPct}`);

  // Put wrong segment after correct by shifting its offset
  // (both start at the 'top' due to stroke-dashoffset=25)
  label.textContent = `${pct}%`;
}

function makeLevelCard(rec) {
  const wrong = rec.total - rec.score;
  const el = document.createElement('div');
  el.className = 'card mini';
  el.innerHTML = `
    <div class="lvl-head">
      <strong>Level ${rec.level}</strong>
      <span class="badge">${rec.score}/${rec.total}</span>
    </div>
    <div class="lvl-bars">
      <div class="bar small"><span class="bar-fill" style="width:${(rec.score/rec.total)*100}%"></span></div>
      <div class="muted small">${rec.score} correct • ${wrong} wrong</div>
      <div class="muted tiny">Last played: ${new Date(rec.at).toLocaleString()}</div>
    </div>
  `;
  return el;
}

(function init(){
  const results = getResults().sort((a,b)=>a.level-b.level);

  // Totals
  const totalCorrect = sum(results, r => r.score);
  const totalQuestions = sum(results, r => r.total);
  const totalWrong = Math.max(0, totalQuestions - totalCorrect);

  document.getElementById('totalCorrect').textContent = totalCorrect;
  document.getElementById('totalWrong').textContent   = totalWrong;
  document.getElementById('totalQuestions').textContent = totalQuestions;

  renderDonut(totalCorrect, totalWrong);

  // Summary note + tips
  const pct = totalQuestions ? Math.round((totalCorrect/totalQuestions)*100) : 0;
  document.getElementById('summaryNote').textContent =
    totalQuestions
      ? `You answered ${totalCorrect} out of ${totalQuestions} correctly (${pct}%).`
      : `No results yet. Play a level to see your feedback.`;

  const tips = [];
  if (pct < 50) {
    tips.push('Review new vocabulary first.');
    tips.push('Read the question carefully for context words.');
    tips.push('Try Level 1–3 again to build confidence.');
  } else if (pct < 80) {
    tips.push('Great progress—focus on the items you missed.');
    tips.push('Practice tricky pairs: “cap/no cap”, “low-key/high-key”.');
    tips.push('Mix review with fresh levels (4–7).');
  } else {
    tips.push('Nice work—keep your streak going!');
    tips.push('Try time-pressure: answer before the bar empties.');
    tips.push('Attempt higher levels (8–10) for mastery.');
  }
  const tipsList = document.getElementById('tipsList');
  tips.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    tipsList.appendChild(li);
  });

  // Motivation
  const quotes = [
    '“The journey of a thousand miles begins with one step.”',
    '“Small steps every day lead to big results.”',
    '“Practice makes progress.”',
    '“Keep going—you’re closer than you think.”'
  ];
  document.getElementById('motivation').textContent =
    quotes[Math.floor(Math.random()*quotes.length)];

  // Per-level grid
  const grid = document.getElementById('levelsGrid');
  results.forEach(r => grid.appendChild(makeLevelCard(r)));

  // Clear results
  document.getElementById('resetResults').addEventListener('click', () => {
    if (confirm('Clear saved results?')) {
      localStorage.removeItem(RESULTS_KEY);
      location.reload();
    }
  });

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
