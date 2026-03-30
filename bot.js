/* bot.js — EmoTiPaw Chatbot
   FAQ-first → Google Gemini AI fallback (free, no server needed)
*/

/* ============ FAQ DB ============ */
const EmoTiPawFAQs = {
  "hello": "Hey there! 👋 Ask me anything about EmoTiPaw, slang meanings, or quiz tips!",
  "hi": "Hi! 😊 I'm the EmoTiPaw bot. Ask me about slang, levels, or how to play!",
  "how do i start": 'Go to Play → press "Start Level 1". Each level unlocks as you finish it.',
  "how many levels": "There are 10 levels, each with 10 questions. That's 100 slang challenges total!",
  "what is emotipaw": "EmoTiPaw is a slang learning game: 10 levels × 10 multiple-choice questions with a 5-second timer per question and instant feedback.",
  "how is scoring calculated": "Each correct answer is +1. Your per-level score is out of 10.",
  "timer": "You have 5 seconds per question. When time runs out, press Next to continue — but you won't get the point.",
  "retry": 'Yes! After finishing a level, choose "Retry Level" to restart from question 1.',
  "next level": "Finish a level and choose Next Level on the end-of-level panel. After level 10 you will see the Feedback page.",
  "achievements": "Achievements are badges you unlock based on progress, like First Quest, High Scorer, and Perfect 10.",
  "feedback": "After completing levels, open the Feedback page for your donut chart, per-level breakdown, and tips.",
  "progress save": "Yes! Progress is stored in your browser's localStorage — scores, streaks, and play state are all saved.",
  "reset": 'On the Feedback page, press "Clear Results" to erase your saved scores.',
  "account": "Create an account on the Login page. Each login restores your local progress.",
  "free": "Yes — EmoTiPaw is completely free to play!",
  "what does lit mean": '"Lit" means amazing or exciting. Example: "That party was lit!"',
  "what does no cap mean": '"No cap" means for real or I am not lying. Example: "No cap, that was the best pizza ever."',
  "what does salty mean": '"Salty" means upset or annoyed. Example: "He was so salty after losing."',
  "what does sus mean": '"Sus" is short for suspicious. Example: "That move was kinda sus."',
  "what does vibe mean": '"Vibe" means a feeling or atmosphere. Example: "This place has such a good vibe."',
  "what does goat mean": '"GOAT" stands for Greatest Of All Time. Example: "She is the GOAT at this game."',
  "what does lowkey mean": '"Low-key" means slightly or subtly. Example: "I low-key love this song."',
  "what does ghosting mean": '"Ghosting" means suddenly ignoring someone with no explanation.',
  "what does flex mean": '"Flex" means to show off. Example: "He is always flexing his new shoes."',
  "what does bet mean": '"Bet" means okay or agreed. Example: "Want to hang out later?" "Bet."',
  "what does gm mean": '"GM" means Good Morning — a common greeting online and in gaming communities.',
  "what does gn mean": '"GN" means Good Night — used to say goodbye at the end of the day.',
  "what does ngl mean": '"NGL" means Not Gonna Lie — used before an honest opinion. Example: "NGL, that was fire."',
  "what does fr mean": '"FR" means For Real — used to emphasize something. Example: "That slaps, fr."',
  "what does imo mean": '"IMO" means In My Opinion. Example: "IMO, level 5 is the hardest."',
  "bug": "Found a bug? Use the Contact link in the footer to report it with steps to reproduce.",
  "offline": "You can load cached pages offline, but the AI chatbot needs an internet connection.",
  "privacy": "EmoTiPaw stores game data in localStorage only and does not share personal data.",
};

function matchFAQ(message) {
  const m = String(message).toLowerCase();
  for (const q in EmoTiPawFAQs) {
    if (m.includes(q)) return EmoTiPawFAQs[q];
  }
  return null;
}

/* ============ CONFIG — your Gemini key ============ */
const GEMINI_API_KEY = "AIzaSyACOHK3kY3JoosAzXA-I0_HkXvVy3px_p4"; // ←------------------------------------------

const SYSTEM_PROMPT = "You are the EmoTiPaw Bot, a friendly assistant for a web-based English slang learning game. Explain slang words simply with short example sentences. Help with game tips. Keep replies to 2-4 sentences. Only discuss slang, English, or the EmoTiPaw game. Be friendly and fun.";

/* ============ Gemini API call ============
   FIX: Every model entry MUST have a "ver" field.
   gemini-2.5-flash was missing "ver" → URL became "undefined/models/..." → crash
*/
const GEMINI_MODELS = [
  { model: "gemini-2.5-flash", ver: "v1beta" }, 
  { model: "gemini-2.0-flash", ver: "v1beta" },
  { model: "gemini-2.0-flash-lite", ver: "v1beta" },
  { model: "gemini-1.5-flash", ver: "v1" },
];

async function tryModel(entry, message) {
  const url =
    "https://generativelanguage.googleapis.com/" +
    entry.ver + "/models/" + entry.model +
    ":generateContent?key=" + GEMINI_API_KEY;

  const body = {
    contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + message }] }],
    generationConfig: { maxOutputTokens: 300 }
  };

  // FIX: wrap in try/catch so network errors don't crash the whole function
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    console.log("Trying " + entry.ver + "/" + entry.model + " — status: " + response.status);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Error body:", JSON.stringify(err));
      return { ok: false, status: response.status };
    }

    const data = await response.json();
    const text =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    return { ok: true, text: text };

  } catch (networkErr) {
    // FIX: catches fetch/network exceptions so the loop can continue
    console.error("Network error for " + entry.model + ":", networkErr);
    return { ok: false, status: 0 };
  }
}

async function getClaudeResponse(message) {
  for (var i = 0; i < GEMINI_MODELS.length; i++) {
    var entry = GEMINI_MODELS[i];
    var result = await tryModel(entry, message);

    if (result.ok) {
      console.log("Success with: " + entry.model);
      return result.text || "Sorry, I did not get a response. Try again!";
    }
    if (result.status === 403) return "API key invalid. Go to aistudio.google.com/apikey and create a new key.";
    if (result.status === 429) return "Too many requests! Wait 30 seconds and try again.";

    console.log("Model " + entry.model + " failed, trying next...");
  }
  return "Hmm, I can't reach the AI right now. Check your internet and try again!";
}

/* ============ UI WIRING ============ */
(function () {
  const modal = document.getElementById("botModal");
  const openers = document.querySelectorAll(".bot-trigger");
  const closer = document.getElementById("botClose");
  const form = document.getElementById("botForm");
  const input = document.getElementById("chat-input");
  const win = document.getElementById("chat-window");

  if (!modal || !form || !input || !win) return;

  function openBot(e) {
    if (e) e.preventDefault();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    input.focus();
  }
  function closeBot() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  openers.forEach(function (a) { a.addEventListener("click", openBot); });
  if (closer) closer.addEventListener("click", closeBot);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeBot(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBot(); });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function addMsg(text, who) {
    who = who || "user";
    const wrap = document.createElement("div");
    wrap.className = "msg " + who;
    wrap.innerHTML = '<div class="bubble">' + escapeHtml(text) + '</div>';
    win.appendChild(wrap);
    win.scrollTop = win.scrollHeight;
    return wrap;
  }

  // FIX: wrapped entire submit handler in try/finally so input is ALWAYS re-enabled
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    addMsg(userText, "user");
    input.value = "";
    input.disabled = true;

    const typingWrap = addMsg("Typing...", "bot");

    try {
      const faq = matchFAQ(userText);
      if (faq) {
        typingWrap.querySelector(".bubble").textContent = faq;
      } else {
        const reply = await getClaudeResponse(userText);
        typingWrap.querySelector(".bubble").textContent = reply;
      }
    } catch (err) {
      // Safety net — should never reach here, but just in case
      typingWrap.querySelector(".bubble").textContent = "Something went wrong. Please try again!";
      console.error("Unexpected bot error:", err);
    } finally {
      // ALWAYS re-enable input, no matter what happened above
      win.scrollTop = win.scrollHeight;
      input.disabled = false;
      input.focus();
    }
  });
})();
