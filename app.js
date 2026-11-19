const searchInput = document.querySelector("#command-search");
const commandCards = [...document.querySelectorAll(".command-card")];
const filterButtons = [...document.querySelectorAll(".filter")];
const emptyState = document.querySelector("#empty-state");
const toast = document.querySelector("#toast");
let activeFilter = "all";
let toastTimer;

function filterCommands() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  commandCards.forEach((card) => {
    const categoryMatch = activeFilter === "all" || card.dataset.category === activeFilter;
    const searchMatch = !query || `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query);
    const show = categoryMatch && searchMatch;
    card.classList.toggle("hidden", !show);
    if (show) visible += 1;
  });

  emptyState.hidden = visible !== 0;
}

searchInput.addEventListener("input", filterCommands);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    filterCommands();
  });
});

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = "Copied";
      showToast(`Copied: ${value}`);
      setTimeout(() => (button.textContent = "Copy"), 1400);
    } catch {
      showToast("Copy was blocked. Select the command manually.");
    }
  });
});

const terminalForm = document.querySelector("#terminal-form");
const terminalInput = document.querySelector("#terminal-input");
const practiceOutput = document.querySelector("#practice-output");

const responses = {
  help: "Available commands: help, pwd, ls, git status, whoami, clear",
  pwd: "/Users/you/projects/command-canvas",
  ls: "README.md    app.js    index.html    styles.css",
  "git status": "On branch main\nnothing to commit, working tree clean",
  whoami: "terminal-learner",
};

function addTerminalLine(text, className = "output") {
  const line = document.createElement("p");
  line.className = className;
  line.textContent = text;
  practiceOutput.append(line);
  practiceOutput.scrollTop = practiceOutput.scrollHeight;
}

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const command = terminalInput.value.trim().toLowerCase();
  if (!command) return;

  addTerminalLine(`$ ${command}`, "entered");
  terminalInput.value = "";

  if (command === "clear") {
    practiceOutput.replaceChildren();
    return;
  }

  addTerminalLine(
    responses[command] ?? `Command not available in safe mode: ${command}\nType help to see your options.`,
  );
});

const checklist = [...document.querySelectorAll("#checklist input")];
const progressCount = document.querySelector("#progress-count");
const progressBar = document.querySelector("#progress-bar");
const storageKey = "command-canvas-progress";

function saveProgress() {
  const completed = checklist.filter((item) => item.checked).map((item) => item.dataset.step);
  localStorage.setItem(storageKey, JSON.stringify(completed));
  updateProgress();
}

function updateProgress() {
  const completed = checklist.filter((item) => item.checked).length;
  progressCount.textContent = `${completed} of ${checklist.length} complete`;
  progressBar.style.width = `${(completed / checklist.length) * 100}%`;
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  checklist.forEach((item) => (item.checked = saved.includes(item.dataset.step)));
} catch {
  localStorage.removeItem(storageKey);
}

checklist.forEach((item) => item.addEventListener("change", saveProgress));
updateProgress();
