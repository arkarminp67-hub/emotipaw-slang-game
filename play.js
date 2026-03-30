/* play.js — Levels 1–10 with Retry / Next Level + optional Go-to-Level-1 link
   - Text-only MCQs, 10 levels × 10 Qs
   - 5s timer per question
   - End-of-level panel: Retry + Next (final level => feedback)
   - Small "Go to Level 1" link at the bottom
*/
const _curUser = JSON.parse(localStorage.getItem("sq.currentUser") || "null");
const nickname = (_curUser && _curUser.nickname) || localStorage.getItem("nickname") || "Guest";
console.log("Logged in as:", nickname);
const CUR_KEY = "sq.currentUser";
const RESULTS_KEY = "sq.results";
const PS_KEY = "sq.playState"; // persist current play state
const user = JSON.parse(localStorage.getItem(CUR_KEY) || "null");
if (!user) location.href = "auth.html?next=play.html";

/* ---------------- DATA (ASCII only) ---------------- */
const LEVELS = [
  // Level 1
  [
    { q: 'What does "lit" most nearly mean?', correct: "amazing", opts: { obvious: "very obvious", amazing: "amazing / exciting", angry: "angry", tired: "tired" } },
    { q: 'Pick the best meaning for "salty".', correct: "upset", opts: { happy: "happy", upset: "upset / annoyed", cool: "cool", hungry: "hungry" } },
    { q: '"Low-key" is closest to...', correct: "subtle", opts: { subtle: "a little / subtly", public: "publicly", loud: "very loud", fake: "not real" } },
    { q: '"Flex" most nearly means...', correct: "show", opts: { exercise: "to exercise", show: "to show off", relax: "to relax", break: "to break" } },
    { q: '"Ghost someone" means...', correct: "ignore", opts: { haunt: "to haunt", ignore: "to suddenly ignore", scare: "to scare", copy: "to copy" } },
    { q: '"No cap" means...', correct: "truth", opts: { truth: "for real / not lying", hat: "wearing a hat", limit: "no limit", stop: "stop it" } },
    { q: '"Vibe" is closest to...', correct: "feeling", opts: { music: "music volume", feeling: "feeling / atmosphere", friend: "friend group", place: "location" } },
    { q: '"Cringe" means...', correct: "embarrassing", opts: { embarrassing: "embarrassing / awkward", funny: "very funny", easy: "very easy", smart: "very smart" } },
    { q: '"Sus" is short for...', correct: "suspicious", opts: { sustain: "sustain", suspicious: "suspicious", sushi: "sushi", suspend: "suspend" } },
    { q: '"AFK" means...', correct: "away", opts: { away: "away from keyboard", fast: "fast clicks", attack: "attack first kick", after: "after key" } }
  ],
  // Level 2
  [
    { q: '"Bet" used alone most nearly means...', correct: "ok", opts: { gamble: "to gamble", ok: "okay / agreed", owe: "you owe me", stop: "stop now" } },
    { q: '"GOAT" stands for...', correct: "greatest", opts: { greatest: "Greatest of all time", animal: "Just the animal", game: "Game of a time", group: "Group of a team" } },
    { q: '"Snack" about a person suggests they are...', correct: "attractive", opts: { hungry: "hungry", attractive: "attractive", rude: "rude", small: "small" } },
    { q: '"Spill the tea" means...', correct: "gossip", opts: { pour: "pour tea", gossip: "share the gossip", deny: "deny rumors", hush: "keep quiet" } },
    { q: '"Stan" someone means...', correct: "superfan", opts: { stand: "stand up", superfan: "be a super fan of", ban: "ban them", ignore: "ignore them" } },
    { q: '"Extra" describes someone who is...', correct: "overdoing", opts: { overdoing: "over the top", normal: "very normal", gentle: "gentle", shy: "shy" } },
    { q: '"Shade" in slang is...', correct: "insult", opts: { tree: "tree shade", insult: "subtle insult", color: "dark color", cool: "cool area" } },
    { q: '"Receipts" in drama means...', correct: "proof", opts: { bills: "shopping bills", proof: "proof/screenshots", tickets: "event tickets", edits: "video edits" } },
    { q: '"Drip" usually refers to...', correct: "style", opts: { water: "water leak", style: "fashion/style", speed: "how fast", money: "cash flow" } },
    { q: '"Mood" used alone means...', correct: "relate", opts: { sad: "feeling sad", relate: "I relate to that", food: "I need food", move: "Let's move" } }
  ],
  // Level 3
  [
    { q: '"Low-key flex" means...', correct: "quietShow", opts: { quietShow: "subtle showing off", loudBrag: "loud brag", noShow: "not showing", fake: "fake news" } },
    { q: "I'm dead usually means...", correct: "laughing", opts: { hurt: "physically hurt", laughing: "laughing a lot", bored: "very bored", sleepy: "super sleepy" } },
    { q: '"Boujee" describes...', correct: "fancy", opts: { cheap: "cheap", fancy: "luxurious/fancy", angry: "angry", boring: "boring" } },
    { q: "I can't even expresses...", correct: "overwhelmed", opts: { math: "can't do math", overwhelmed: "too overwhelmed", hungry: "hungry", agree: "agree strongly" } },
    { q: '"Hot take" is...', correct: "bold", opts: { bold: "bold/controversial opinion", retry: "second try", heat: "hot weather report", trend: "trending news only" } },
    { q: '"Left on read" means...', correct: "seenNoReply", opts: { seenNoReply: "they saw but didn't reply", unread: "never opened", blocked: "blocked you", erased: "erased chat" } },
    { q: '"Thirsty" (for attention) means...', correct: "desperate", opts: { drink: "needing a drink", desperate: "desperate for attention", healthy: "very healthy", shy: "shy about posting" } },
    { q: '"Cap" by itself means...', correct: "lie", opts: { hat: "a hat", lie: "that's a lie", clap: "clap loudly", limit: "cap/limit" } },
    { q: '"Say less" means...', correct: "understood", opts: { quiet: "be quieter", understood: "I understand/agree", refuse: "refuse strongly", longer: "say more" } },
    { q: '"Ship" two people means...', correct: "supportPair", opts: { boat: "put on a boat", supportPair: "support them as a couple", break: "break them up", hire: "hire them" } }
  ],
  // Level 4
  [
    { q: '"Sus energy" means someone seems...', correct: "suspicious", opts: { sleepy: "sleepy", suspicious: "suspicious", excited: "excited", generous: "generous" } },
    { q: '"Vibe check" is...', correct: "moodCheck", opts: { security: "ID check", moodCheck: "check the mood/behavior", money: "budget check", health: "medical exam" } },
    { q: '"Clout" is...', correct: "influence", opts: { cloud: "weather cloud", noise: "loud noise", influence: "social influence", clothes: "clothing brand" } },
    { q: '"High-key" is the opposite of...', correct: "lowkey", opts: { lowkey: "low-key", loud: "loudly", quiet: "quiet", mid: "mid-level" } },
    { q: '"Mid" means...', correct: "average", opts: { top: "top quality", average: "average/just okay", worst: "the worst", mystery: "mysterious" } },
    { q: '"Touch grass" tells someone to...', correct: "goOutside", opts: { sleep: "go sleep", goOutside: "go outside/relax", run: "run fast", clean: "clean room" } },
    { q: '"Main character energy" suggests...', correct: "confident", opts: { lost: "lost person", confident: "standing out/confident", extra: "too dramatic", quiet: "very quiet" } },
    { q: "Receipts or it didn't happen asks for...", correct: "evidence", opts: { refund: "money back", evidence: "proof", apology: "apology", copy: "photocopy" } },
    { q: '"Hard launch" a relationship means...', correct: "publicAnnounce", opts: { soft: "soft mention", publicAnnounce: "clear public announce", secret: "keep secret", break: "break up" } },
    { q: '"Soft launch" means...', correct: "subtleReveal", opts: { loud: "loud reveal", subtleReveal: "hint/subtle reveal", cancel: "cancel plans", fake: "fake post" } }
  ],
  // Level 5
  [
    { q: '"Based" most nearly means...', correct: "authentic", opts: { authentic: "authentic / true to self", biased: "biased", copied: "copied", basic: "basic" } },
    { q: '"Receipts were posted" means...', correct: "proofShown", opts: { payment: "payment bills", proofShown: "proof shown", props: "props given", delete: "deleted files" } },
    { q: '"It slaps" refers to...', correct: "excellent", opts: { hit: "got hit", excellent: "it's excellent", loud: "too loud", slow: "very slow" } },
    { q: '"Periodt." adds...', correct: "final", opts: { pause: "short pause", final: "emphasis / final", ask: "question mark", comma: "comma splice" } },
    { q: '"Valid" means...', correct: "reasonable", opts: { id: "ID valid", reasonable: "reasonable/cool", expired: "expired", wrong: "incorrect" } },
    { q: '"Camp" (style) means...', correct: "playful", opts: { camping: "go camping", playful: "playfully exaggerated", military: "military camp", rough: "rough look" } },
    { q: '"Gatekeep" means...', correct: "withhold", opts: { share: "share freely", withhold: "withhold info/access", open: "open doors", rename: "rename it" } },
    { q: '"NPC" used as slang means...', correct: "background", opts: { player: "a player", background: "acts like background character", coder: "game coder", cheat: "cheater" } },
    { q: '"Ratioed" on social means...', correct: "moreReplies", opts: { moreLikes: "more likes", moreReplies: "replies > likes", equal: "equal stats", views: "more views" } },
    { q: '"Punching up" humor targets...', correct: "powerful", opts: { weak: "the weak", powerful: "the powerful", random: "random people", self: "self only" } }
  ],
  // Level 6
  [
    { q: '"W" and "L" mean...', correct: "winLose", opts: { west: "west/east", winLose: "win / loss", wow: "wow / lame", wait: "wait / leave" } },
    { q: '"Rent free" in my head means...', correct: "cantStop", opts: { cheap: "cheap rent", cantStop: "can't stop thinking about it", block: "block them", move: "move house" } },
    { q: '"Cook" in slang means...', correct: "performWell", opts: { kitchen: "kitchen work", performWell: "perform very well", burn: "burn someone", copy: "copy notes" } },
    { q: '"Pull up" means...', correct: "comeOver", opts: { park: "park closer", comeOver: "come over/arrive", pull: "pull the door", upload: "upload now" } },
    { q: '"Gas" someone up is to...', correct: "praise", opts: { fuel: "give fuel", praise: "hype/praise", expose: "expose them", leave: "leave them" } },
    { q: '"Simp" for someone means...', correct: "overlyDevoted", opts: { simple: "a simple person", overlyDevoted: "overly devoted", sarcastic: "sarcastic", pro: "professional" } },
    { q: "I'm weak means...", correct: "laughHard", opts: { tired: "tired", laughHard: "laughing hard", hungry: "hungry", shy: "shy" } },
    { q: '"Cooked" as an adjective means...', correct: "exhausted", opts: { exhausted: "exhausted/out of it", finished: "food finished", cool: "cool/relaxed", fake: "fake story" } },
    { q: '"Receipts in DMs" means...', correct: "privateProof", opts: { public: "public proof", privateProof: "private screenshots", gift: "gift receipts", spam: "spam links" } },
    { q: '"Hard carry" means...', correct: "carriedTeam", opts: { lug: "physically carry", carriedTeam: "one person carried the team", hire: "hire help", kick: "kick out" } }
  ],
  // Level 7
  [
    { q: '"Low effort" post means...', correct: "littleWork", opts: { littleWork: "little work put in", recycled: "100% recycled", expensive: "expensive", deep: "very deep" } },
    { q: '"Viral" means...', correct: "widelyShared", opts: { sick: "sick person", widelyShared: "widely shared online", fake: "fake story", private: "private content" } },
    { q: '"Main" as a verb (games) means...', correct: "primaryPick", opts: { menu: "open menu", primaryPick: "choose as primary", trade: "trade item", quit: "quit quickly" } },
    { q: '"One-liner" response is...', correct: "shortJoke", opts: { shortJoke: "short joke/retort", essay: "long essay", threat: "a threat", quote: "a quote only" } },
    { q: '"Spicy take" means...', correct: "boldView", opts: { food: "food is spicy", boldView: "bold opinion", angry: "angry reply", rude: "rude tone only" } },
    { q: '"Campy outfit" reads as...', correct: "theatrical", opts: { hiking: "for hiking", theatrical: "playful/theatrical", dirty: "dirty clothes", basic: "basic wear" } },
    { q: '"Heated thread" is...', correct: "argument", opts: { warm: "slightly warm", argument: "full of arguments", empty: "no replies", helpful: "very helpful" } },
    { q: '"Chill" as verb means...', correct: "relax", opts: { freeze: "get cold", relax: "relax/calm down", quit: "quit job", slow: "walk slowly" } },
    { q: '"Hard pass" means...', correct: "definitelyNo", opts: { ticket: "sports ticket", definitelyNo: "definitely no", maybe: "maybe later", test: "pass a test" } },
    { q: '"Wholesome" content is...', correct: "positive", opts: { adult: "adult only", sarcastic: "sarcastic", positive: "kind/positive", violent: "violent" } }
  ],
  // Level 8
  [
    { q: '"Down bad" most nearly means...', correct: "desperateRom", opts: { sad: "a little sad", desperateRom: "very desperate (often romantic)", sick: "sick", broke: "broke only" } },
    { q: '"Receipts were cooked" (lies) means...', correct: "fakeProof", opts: { fresh: "fresh proof", fakeProof: "edited/fake proof", old: "old proof", none: "no proof" } },
    { q: '"Clap back" means...', correct: "sharpReply", opts: { applaud: "applaud back", sharpReply: "sharp reply/return insult", ban: "ban user", follow: "follow back" } },
    { q: '"Touch grass moment" suggests...', correct: "logOff", opts: { success: "success post", logOff: "go offline/relax", workout: "work out", eat: "eat veggies" } },
    { q: '"Ate and left no crumbs" means...', correct: "nailedIt", opts: { mess: "made a mess", nailedIt: "performed perfectly", lost: "lost badly", shared: "shared equally" } },
    { q: '"Cookbook play" in games implies...', correct: "standard", opts: { new: "brand new tactic", standard: "standard textbook play", random: "random move", risky: "very risky" } },
    { q: '"On read" vs "on delivered": "on read" means...', correct: "seen", opts: { sent: "message sent only", seen: "seen", failed: "failed", typed: "typing" } },
    { q: '"TMI" stands for...', correct: "tooMuch", opts: { tooMuch: "too much information", tryMore: "try more info", timeIn: "time in", tellMe: "tell me info" } },
    { q: '"Destroyed" someone in comments means...', correct: "wonArgument", opts: { block: "blocked them", wonArgument: "won the argument", ignored: "ignored", reported: "reported" } },
    { q: '"Pick-me" behavior is...', correct: "seekApprove", opts: { lead: "lead group", seekApprove: "seeking approval by putting others down", share: "sharing wins", teach: "teaching calmly" } }
  ],
  // Level 9
  [
    { q: '"Malarkey" (older slang) means...', correct: "nonsense", opts: { nonsense: "nonsense", food: "a food", walk: "a walk", music: "a music style" } },
    { q: '"Savage" praise means...', correct: "fearless", opts: { mean: "mean only", fearless: "fearless / brutally honest", friendly: "super friendly", quiet: "quiet" } },
    { q: '"Bop" refers to...', correct: "goodSong", opts: { hit: "punch", goodSong: "a good song", meme: "a meme", dance: "a dance only" } },
    { q: '"Low effort meme" label implies...', correct: "lazyWork", opts: { lazyWork: "lazy work", newArt: "new art", long: "very long read", deep: "deep thought" } },
    { q: '"Big yikes" expresses...', correct: "strongEmbarrassment", opts: { small: "small embarrassment", strongEmbarrassment: "strong embarrassment", win: "big win", calm: "calm mood" } },
    { q: '"Receipts on main" means...', correct: "publicProof", opts: { draft: "draft only", publicProof: "public proof on main account", alt: "posted on alt", dm: "in DMs" } },
    { q: '"Hard stuck" means...', correct: "noProgress", opts: { busy: "busy", noProgress: "stuck/no progress", bored: "bored", easy: "easy level" } },
    { q: '"Farm" in games is to...', correct: "gather", opts: { plant: "plant seeds", gather: "gather resources/points", win: "win fast", hide: "hide from enemies" } },
    { q: '"Smurfing" in games is...', correct: "altLow", opts: { blue: "turn blue", altLow: "using a low-rank alt account", skin: "buying skin", dance: "taunt dance" } },
    { q: '"Meta" means...', correct: "mostEffective", opts: { story: "story about story", mostEffective: "most effective strategy", random: "random build", glitch: "a glitch" } }
  ],
  // Level 10
  [
    { q: '"Cooked them in the debate" means...', correct: "outperformed", opts: { late: "came late", outperformed: "outperformed strongly", copied: "copied points", hosted: "hosted debate" } },
    { q: '"Omega cringe" is...', correct: "maxEmbarrassment", opts: { tiny: "tiny embarrassment", maxEmbarrassment: "maximum embarrassment", praise: "great praise", funny: "only funny" } },
    { q: '"Sauce?" in comments asks for...', correct: "source", opts: { ketchup: "ketchup", source: "source/link", price: "price tag", author: "author name only" } },
    { q: '"Skill issue" reply suggests...', correct: "improveSkill", opts: { hardware: "hardware fault", improveSkill: "need to improve skill", internet: "internet issue", luck: "just bad luck" } },
    { q: '"Mid at best" rates something as...', correct: "average", opts: { amazing: "amazing", average: "average", terrible: "terrible", unknown: "unknown" } },
    { q: '"Rent-free for a year" exaggerates...', correct: "constantThought", opts: { house: "free house", constantThought: "constant obsession", debt: "debt free", ignore: "ignore forever" } },
    { q: '"Sigma grindset" meme points to...', correct: "hustleMind", opts: { sleep: "sleep schedule", hustleMind: "solo hustler mindset", party: "party life", school: "school rules" } },
    { q: "This ain't it means...", correct: "badChoice", opts: { correct: "correct choice", badChoice: "bad choice", start: "start now", secret: "keep secret" } },
    { q: '"Cook with me" (figurative) invites...', correct: "performTogether", opts: { kitchen: "kitchen cooking", performTogether: "perform well together", argue: "argue", wait: "wait there" } },
    { q: '"Peak" used as praise means...', correct: "topTier", opts: { mountain: "a mountain", early: "early peak", topTier: "top-tier", end: "the end" } }
  ]
];

/* ---------------- Elements ---------------- */
const fill = document.getElementById("timerFill");
const titleEl = document.getElementById("chTitle");
const qText = document.getElementById("questionText");
const form = document.getElementById("qForm");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const feedback = document.getElementById("feedback");
const counter = document.getElementById("counter");
const scoreVal = document.getElementById("scoreVal");
const celebrateEl = document.getElementById("celebrate");
const levelBadge = document.getElementById("levelBadge");
const levelEnd = document.getElementById("levelEnd");
const levelEndTitle = document.getElementById("levelEndTitle");
const levelEndMsg = document.getElementById("levelEndMsg");
const retryBtn = document.getElementById("retryBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");

/* -------- Start screen wiring -------- */
const startCard = document.getElementById("startCard");
const startBtn = document.getElementById("startBtn");
const startTitle = document.getElementById("startTitle");
const startMsg = document.getElementById("startMsg");

const topRowEl = document.querySelector(".top-row");
const challengeEl = document.querySelector("section.challenge");
const navRowEl = document.querySelector(".ch-nav");
const gameBlocks = [topRowEl, challengeEl, navRowEl];

let started = false;
let resetOnNextStart = false; // when retrying or going Level 1, start idx/score from 0

/* ---------------- State ---------------- */
let level = 0;   // 0..9
let idx = 0;     // 0..9 within level
let score = 0;   // per-level score
let lock = false;

/* Optional deep-link: play.html?level=3 (1-based) */
(() => {
  const p = new URLSearchParams(location.search);
  const L = parseInt(p.get("level"), 10);
  if (!isNaN(L) && L >= 1 && L <= LEVELS.length) {
    level = L - 1;
    idx = 0;
    score = 0;
    resetOnNextStart = true;
  }
})();

/* ---------- Persistence helpers ---------- */
function savePlayState(state = {}) {
  const rec = { level, idx, score, started, ...state, at: Date.now() };
  try { localStorage.setItem(PS_KEY, JSON.stringify(rec)); } catch { }
}

function loadPlayState() {
  try {
    const raw = localStorage.getItem(PS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj && typeof obj.level === "number" && obj.level >= 0 && obj.level < LEVELS.length) {
      return obj;
    }
  } catch { }
  return null;
}

/* ---------------- Timer ---------------- */
const duration = 5; // seconds per question
let iv;
function startTimer() {
  if (!started) return;
  clearInterval(iv);
  let t = duration;
  if (fill) fill.style.width = "100%";
  iv = setInterval(() => {
    t -= 0.1;
    if (fill) fill.style.width = Math.max(0, (t / duration) * 100) + "%";
    if (t <= 0) {
      clearInterval(iv);
      if (!lock) {
        lock = true;
        if (feedback) feedback.textContent = "Time's up. You can go Next.";
        if (submitBtn) submitBtn.disabled = true;
        if (nextBtn) nextBtn.focus();
      }
    }
  }, 100);
}

/* ---------------- Celebration ---------------- */
function celebrate() {
  if (!celebrateEl) return;
  celebrateEl.innerHTML = "";
  celebrateEl.classList.add("show");
  for (let k = 0; k < 40; k++) {
    const s = document.createElement("span");
    s.className = "confetti";
    s.style.left = (5 + Math.random() * 90) + "%";
    s.style.setProperty("--tx", (Math.random() * 100 - 50) + "px");
    s.style.setProperty("--rot", (Math.random() * 600 - 300) + "deg");
    s.style.animationDelay = (Math.random() * 0.2) + "s";
    celebrateEl.appendChild(s);
  }
  setTimeout(() => celebrateEl.classList.remove("show"), 1200);
}

/* ---------------- Render ---------------- */
function render() {
  if (!started) return;

  const L = LEVELS[level];
  const q = L[idx];

  if (levelBadge) levelBadge.textContent = `Level ${level + 1}`;
  if (titleEl) titleEl.textContent = `Challenge ${idx + 1}`;
  if (qText) qText.textContent = q.q;
  if (counter) counter.textContent = `${idx + 1} / ${L.length}`;
  if (scoreVal) scoreVal.textContent = String(score);
  if (feedback) { feedback.textContent = ""; feedback.classList.remove("ok"); }
  if (submitBtn) submitBtn.disabled = false;
  lock = false;

  if (form) {
    form.innerHTML = "";
    Object.entries(q.opts).forEach(([val, label]) => {
      const wrap = document.createElement("label");
      wrap.innerHTML = `<input type="radio" name="opt" value="${val}" required> ${label}`;
      form.appendChild(wrap);
    });
  }

  savePlayState({ started: true });
  startTimer();
}

/* -------- Start card helpers -------- */
function showStartFor(lvlIndex) {
  started = false;
  clearInterval(iv);
  if (fill) fill.style.width = "0%";
  gameBlocks.forEach(el => el && el.classList.add("is-hidden"));
  if (startTitle) startTitle.textContent = `Level ${lvlIndex + 1}`;
  if (startMsg) startMsg.textContent = `10 quick questions. You have ${duration}s per question. Ready?`;
  if (startBtn) startBtn.textContent = `Start Level ${lvlIndex + 1}`;
  if (startCard) startCard.classList.remove("is-hidden");

  savePlayState({ started: false });
}
function showGame() {
  gameBlocks.forEach(el => el && el.classList.remove("is-hidden"));
  if (startCard) startCard.classList.add("is-hidden");
  started = true;

  if (resetOnNextStart) {
    idx = 0;
    score = 0;
    resetOnNextStart = false;
  }

  render();
}

/* ---------------- Save result (for feedback page) ---------------- */
function saveLevelResult(levelIndex, scoreValNum, total) {
  const rec = {
    level: levelIndex + 1,
    score: scoreValNum,
    total,
    user: (user && (user.email || user.username)) ? (user.email || user.username) : "anonymous",
    at: new Date().toISOString()
  };
  const arr = JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
  const rest = arr.filter(r => r.level !== rec.level);
  rest.push(rec);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(rest.sort((a, b) => a.level - b.level)));
}

/* ---------- helper: tiny 'Go to Level 1' link on end panel ---------- */
let goL1Btn;
(function ensureGoToLevel1Link() {
  if (!levelEnd) return;
  const existing = document.getElementById("goL1Btn");
  if (existing) { goL1Btn = existing; return; }
  const wrap = document.createElement("div");
  wrap.style.marginTop = "10px";
  wrap.style.textAlign = "center";
  const btn = document.createElement("button");
  btn.id = "goL1Btn";
  btn.type = "button";
  btn.className = "link-plain";
  btn.textContent = "Go to Level 1";
  wrap.appendChild(btn);
  levelEnd.appendChild(wrap);
  goL1Btn = btn;
})();

/* ---------------- Level end panel ---------------- */
function showLevelEnd() {
  const total = LEVELS[level].length;
  saveLevelResult(level, score, total);

  // added this for track ###
  updateUserScore(nickname, level + 1, score);

  const isLast = level >= LEVELS.length - 1;
  if (levelEndTitle) levelEndTitle.textContent = isLast ? "Final Level Complete" : `Level ${level + 1} Complete`;
  if (levelEndMsg) levelEndMsg.textContent = `Your score: ${score}/${total}`;

  if (retryBtn) retryBtn.textContent = "Retry Level";
  if (nextLevelBtn) nextLevelBtn.textContent = isLast ? "Finish & See Feedback" : "Next Level";

  if (levelEnd) levelEnd.classList.remove("hidden");
  if (nextLevelBtn) nextLevelBtn.focus();

  savePlayState({ started: false });
}
function hideLevelEnd() {
  if (levelEnd) levelEnd.classList.add("hidden");
}

/* ---------------- Navigation helpers ---------------- */
function onRetryLevel() {
  hideLevelEnd();
  resetOnNextStart = true;
  showStartFor(level);
}

function onNextLevel() {
  const isLast = level >= LEVELS.length - 1;
  hideLevelEnd();
  if (isLast) {
    savePlayState({ started: false });
    location.href = "feedback.html";
  } else {
    level++;
    resetOnNextStart = true;
    showStartFor(level);
  }
}

function onGoLevelOne() {
  hideLevelEnd();
  level = 0; idx = 0; score = 0;
  resetOnNextStart = true;
  savePlayState({ level: 0, idx: 0, score: 0, started: false });
  showStartFor(0);
}

/* ---------------- Event handlers ---------------- */
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    if (!started || lock) return;

    const data = form ? new FormData(form) : new FormData();
    const ans = data.get("opt");
    if (!ans) { if (feedback) feedback.textContent = "Pick an answer."; return; }

    lock = true;
    submitBtn.disabled = true;
    clearInterval(iv);

    const correct = LEVELS[level][idx].correct;
    if (ans === correct) {
      score++;
      if (scoreVal) scoreVal.textContent = String(score);
      if (feedback) { feedback.textContent = "Correct! 🎉"; feedback.classList.add("ok"); }
      celebrate();
    } else {
      if (feedback) { feedback.textContent = "Not quite. Keep going!"; feedback.classList.remove("ok"); }
    }

    savePlayState({ started: true });
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (!started) return;
    const L = LEVELS[level];
    if (idx < L.length - 1) {
      idx++;
      savePlayState({ started: true });
      render();
    } else {
      showLevelEnd();
    }
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (!started) return;
    if (idx > 0) {
      idx--;
      savePlayState({ started: true });
      render();
    }
  });
}

if (retryBtn) retryBtn.addEventListener("click", onRetryLevel);
if (nextLevelBtn) nextLevelBtn.addEventListener("click", onNextLevel);
if (goL1Btn) goL1Btn.addEventListener("click", onGoLevelOne);

/* Start button */
if (startBtn) startBtn.addEventListener("click", showGame);

/* ---------------- Init ---------------- */
(function initFromState() {
  const hasDeepLink = new URLSearchParams(location.search).has("level");
  if (!hasDeepLink) {
    const ps = loadPlayState();
    if (ps) {
      level = ps.level ?? level;
      idx = ps.idx ?? idx;
      score = ps.score ?? score;
    }
  }
  showStartFor(level);
})();

// ── Save score to SheetDB ─────────────────────────────────────────────────
const SCORES_API = "https://sheetdb.io/api/v1/p4j2z8q7vlhdc";

async function updateUserScore(nicknameVal, levelNum, scoreNum) {
  const payload = {
    data: [{
      nickname: nicknameVal,
      level: String(levelNum),
      score: String(scoreNum),
      date: new Date().toLocaleDateString()
    }]
  };
  try {
    const res = await fetch(SCORES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log("✅ Score saved to sheet:", result);
  } catch (err) {
    console.error("⚠️ Error saving score:", err);
  }
}