
const BACKEND_URL = "https://study-ai-backend.study-ai.workers.dev";

const dom = {
  chat: document.getElementById("chatWindow"),
  tpl: document.getElementById("bubble-tpl"),
  input: document.getElementById("composerInput"),
  send: document.getElementById("sendBtn"),
  btnFlash: document.getElementById("btn-flashcards"),
  btnTest: document.getElementById("btn-test"),
  btnGuide: document.getElementById("btn-guide"),
  btnSolution: document.getElementById("btn-solution"),
};

let history = [];
let currentTool = null;

function addBubble({ role, content, isError = false }) {
  const frag = dom.tpl.content.cloneNode(true);
  const el = frag.querySelector(".bubble");
  const body = frag.querySelector(".bubble-content");

  if (role === "assistant") {
    el.classList.add("bot");
    const av = document.createElement("div");
    av.className = "avatar";
    av.textContent = "I";
    el.prepend(av);
  } else {
    el.classList.add("user");
  }

    body.innerHTML = marked.parse(content);
  } else {
    el.classList.add("user");
    body.textContent = content;
  }

  if (isError) el.classList.add("error");

  dom.chat.appendChild(frag);
  dom.chat.scrollTop = dom.chat.scrollHeight;

  return el;
}

function setSending(on) {
  dom.send.disabled = on;
  dom.input.disabled = on;
}

function collapseComposer() {
  const el = dom.input;
  el.value = "";
  const minH = parseFloat(getComputedStyle(el).minHeight) || 46;
  el.style.height = minH + "px";
  el.scrollTop = 0;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function showIntro() {
  const intro =
    "Hi, I’m Ivy — your personal study tutor.\n\n" +
    "I can help you:\n" +
    "• Build Flashcards from any topic and export to PDF\n" +
    "• Enter Test mode to generate practice questions (by topic, difficulty, or from your own list)\n" +
    "• Create a structured Study guide from key ideas\n" +
    "• Ask for a Solution to a problem, step-by-step\n\n" +
    "Select a tool above or just start chatting!";
  addBubble({ role: "assistant", content: intro });
  history.push({ role: "assistant", content: intro });
}

const toolPrompts = {
  flashcards:
`You are Ivy, a helpful study assistant. Build concise front/back flashcards.
Prompt format:
Topic: [Insert Topic]
Level: basic | intermediate | advanced
Count: [Insert Count here]]

Return as a bulleted list "Q: ..." then "A: ...". Keep each Q/A short.`,
  test:
`You are Ivy. Create a short practice test.
Choose question types suitable for the subject.
Prompt format:
Topic: [Insert Topic]
Difficulty: easy | medium | hard
NumQuestions: [Number of Questions]`,
  guide:
`You are Ivy. Produce a clean study guide from key ideas.
Prompt format:
Title: [Insert Title]
Key points: [bulleted or comma list]
Return sections with headers, 1–2 sentence explanations, and an overview at top.`,
  solution:
`You are Ivy. Solve the following problem step by step.
Format:
Problem: [paste here]
Show reasoning clearly, then final answer.`,
};

function injectToolPrompt(kind) {
  currentTool = kind;
  const text = toolPrompts[kind];
  addBubble({ role: "assistant", content: `${titleFor(kind)} template inserted below. Customize and send!` });
  appendToInput(text + "\n\n");
}

function titleFor(kind) {
  return {
    flashcards: "Flashcards",
    test: "Test mode",
    guide: "Study guide",
    solution: "Solution",
  }[kind] || "Tool";
}

function appendToInput(text) {
  const cur = dom.input.value;
  dom.input.value = (cur ? cur + "\n" : "") + text;
  dom.input.focus();
  dom.input.setSelectionRange(dom.input.value.length, dom.input.value.length);
}

async function callBackend(prompt) {
  const payload = { prompt, history };
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function addPdfButton(container, title, textProducer) {
  const bar = document.createElement("div");
  bar.className = "toolbar";
  const btn = document.createElement("button");
  btn.className = "tool-btn";
  btn.textContent = "Download PDF";
  btn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    let y = 56;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 56, y);
    y += 24;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    const lines = textProducer();
    lines.forEach(line => {
      const wrapped = doc.splitTextToSize(line, 500);
      wrapped.forEach(l => {
        if (y > 740) { doc.addPage(); y = 56; }
        doc.text(l, 56, y);
        y += 18;
      });
    });

    doc.save(title.replace(/\s+/g, "_") + ".pdf");
  });
  bar.appendChild(btn);
  container.appendChild(bar);
}

async function handleSend() {
  const text = dom.input.value.trim();
  if (!text) return;

  const toolUsed = currentTool;
  currentTool = null;

  addBubble({ role: "user", content: text });
  history.push({ role: "user", content: text });
  dom.input.value = "";
  setSending(true);

  try {
    const data = await callBackend(text);
    const reply = data.reply ?? data.output ?? data.text ?? JSON.stringify(data);

    const bubble = addBubble({ role: "assistant", content: reply });
    history.push({ role: "assistant", content: reply });

    if (toolUsed === "flashcards") {
      addPdfButton(bubble, "Flashcards", () => reply.split("\n").filter(Boolean));
    } else if (toolUsed === "test") {
      addPdfButton(bubble, "Practice_Test", () => reply.split("\n").filter(Boolean));
    } else if (toolUsed === "guide") {
      addPdfButton(bubble, "Study_Guide", () => reply.split("\n").filter(Boolean));
    }
  } catch (err) {
    addBubble({ role: "assistant", content: `Error: ${err.message}`, isError: true });
  } finally {
    setSending(false);
    collapseComposer();
  }
}

dom.send.addEventListener("click", handleSend);

dom.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

dom.btnFlash.addEventListener("click", () => injectToolPrompt("flashcards"));
dom.btnTest.addEventListener("click", () => injectToolPrompt("test"));
dom.btnGuide.addEventListener("click", () => injectToolPrompt("guide"));
dom.btnSolution.addEventListener("click", () => injectToolPrompt("solution"));

function autoResizeTextarea(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

["btn-flashcards", "btn-test", "btn-guide", "btn-solution"].forEach(id => {
  const btn = document.getElementById(id);
  btn.addEventListener("click", () => {
    setTimeout(() => autoResizeTextarea(dom.input), 0);
  });
});

dom.input.addEventListener("input", () => autoResizeTextarea(dom.input));

showIntro();
