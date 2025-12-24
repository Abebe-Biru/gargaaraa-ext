// --- TRANSLATIONS ---
const TRANSLATIONS = {
  am: {
    placeholder: "መልእክት ይጻፉ...", modalTitle: "መቼቶች", apiKey: "የኤፒአይ ቁልፍ", 
    lang: "የምላሽ ቋንቋ", theme: "ገጽታ", save: "አስቀምጥ", apiConf: "ተስተካክሏል",
    welcomeTitle: "ሰላም!", welcomeText: "እኔ ጋርጋራ ነኝ። ምን ልርዳዎ?",
    roleUser: "እርስዎ", roleAI: "ጋርጋራ",
    fileAttached: "ፋይል ተያይዟል", parsing: "በማንበብ ላይ...", errorRead: "ስህተት",
    pastedAsFile: "ጽሑፍ እንደ ፋይል ተያይዟል", reset: "ዳግም", settingsSaved: "መቼቶች ተቀምጠዋል",
    readingPage: "ገጹን በማንበብ ላይ...", pageLoaded: "የገጹ ይዘት ተጭኗል", pageError: "ገጹን ማንበብ አልተቻለም (ደህንነት)"
  },
  om: {
    placeholder: "Ergaa barreessi...", modalTitle: "Qindaa'ina", apiKey: "Furtuu API", 
    lang: "Afaan Deebii", theme: "Bifa", save: "Kusii", apiConf: "Sirreeffameera",
    welcomeTitle: "Akkam!", welcomeText: "Ani Gargaaraa dha. Maal si gargaaru?",
    roleUser: "Isin", roleAI: "Gargaaraa",
    fileAttached: "Faayiliin qabsiifameera", parsing: "Dubbisaa...", errorRead: "Dogoggora",
    pastedAsFile: "Barreeffamni qabsiifameera", reset: "Haqi", settingsSaved: "Qindaa'inni kusameera",
    readingPage: "Fuula dubbisaa jira...", pageLoaded: "Qabiyyeen fuulichaa fe'ameera", pageError: "Fuula dubbisuu hin dandeenye"
  }
};

function t(key) {
  // Default to 'om' if not set
  const lang = document.getElementById("languageSelect").value || 'om';
  return TRANSLATIONS[lang][key] || TRANSLATIONS['om'][key]; 
}

// --- CONFIG ---
const CONFIG = { CONTEXT_WINDOW_SIZE: 6, TYPING_SPEED: 10, PASTE_THRESHOLD: 500 };
let currentAttachment = null;
let chats = []; 

// --- DOM ---
const els = {
  app: document.getElementById("app"),
  messagesList: document.getElementById("messagesList"),
  promptInput: document.getElementById("promptInput"),
  sendBtn: document.getElementById("sendBtn"),
  attachBtn: document.getElementById("attachBtn"),
  readPageBtn: document.getElementById("readPageBtn"),
  fileInput: document.getElementById("fileInput"),
  attachmentPreview: document.getElementById("attachmentPreview"),
  fileName: document.getElementById("fileName"),
  removeFileBtn: document.getElementById("removeFileBtn"),
  settingsModal: document.getElementById("settingsModal"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  apiStatus: document.getElementById("apiStatus"),
  resetApiKey: document.getElementById("resetApiKey"),
  languageSelect: document.getElementById("languageSelect"),
  themeSelect: document.getElementById("themeSelect"),
  newChatBtn: document.getElementById("newChatBtn"),
  container: document.getElementById("messagesContainer"),
  // Labels
  lblModalTitle: document.getElementById("lbl-modalTitle"),
  lblApiKey: document.getElementById("lbl-apiKey"),
  lblLang: document.getElementById("lbl-lang"),
  lblTheme: document.getElementById("lbl-theme"),
  lblApiConf: document.getElementById("lbl-apiConf")
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
  els.app.classList.add('loaded');
  
  const key = localStorage.getItem("API_KEY");
  if(key) {
    els.apiKeyInput.style.display = 'none';
    els.apiStatus.classList.add('show');
  }
  
  // Default to 'om' (Afaan Oromoo)
  els.languageSelect.value = localStorage.getItem("LANG") || "om";
  els.themeSelect.value = localStorage.getItem("THEME") || "light";
  applyTheme(els.themeSelect.value);
  updateLabels();

  chats = JSON.parse(localStorage.getItem("CHAT_MSGS")) || [];
  renderMessages();

  const data = await chrome.storage.local.get("pendingSelection");
  if (data.pendingSelection) {
    handleSelectedText(data.pendingSelection);
    chrome.storage.local.remove("pendingSelection");
  }
});

// --- LOCALIZATION & THEME ---
function updateLabels() {
  els.promptInput.placeholder = t('placeholder');
  els.lblModalTitle.textContent = t('modalTitle');
  els.lblApiKey.textContent = t('apiKey');
  els.lblLang.textContent = t('lang');
  els.lblTheme.textContent = t('theme');
  els.saveSettingsBtn.textContent = t('save');
  els.lblApiConf.textContent = t('apiConf');
  els.resetApiKey.textContent = t('reset');
  if(chats.length > 0) renderMessages();
}

function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  
  if(theme === 'dark') {
    Notiflix.Notify.merge({ background: '#1e293b', textColor: '#fff' });
  } else {
    Notiflix.Notify.merge({ background: '#fff', textColor: '#000' });
  }
}

// --- CORE LOGIC ---
function handleSelectedText(text) {
  if (!text) return;
  if (text.length > CONFIG.PASTE_THRESHOLD) {
    currentAttachment = { name: "selection.txt", content: text };
    els.fileName.textContent = "selection.txt";
    els.attachmentPreview.classList.add("active");
    Notiflix.Notify.success(t('pastedAsFile'));
  } else {
    els.promptInput.value = text;
    els.promptInput.focus();
  }
}

// --- CHAT WITH PAGE LOGIC ---
els.readPageBtn.onclick = async () => {
  Notiflix.Loading.circle(t('readingPage'));
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error("No active tab");

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const clone = document.body.cloneNode(true);
        const trash = clone.querySelectorAll('script, style, noscript, svg, img, iframe');
        trash.forEach(el => el.remove());
        return clone.innerText.replace(/\s+/g, ' ').trim();
      }
    });

    const pageText = result[0].result;
    if (!pageText || pageText.length < 50) throw new Error("Page empty");

    const truncatedText = pageText.substring(0, 20000);
    const title = tab.title || "Webpage";

    currentAttachment = { name: `Web: ${title.substring(0, 15)}...`, content: truncatedText };
    els.fileName.textContent = currentAttachment.name;
    els.attachmentPreview.classList.add("active");
    
    Notiflix.Notify.success(t('pageLoaded'));

  } catch (err) {
    console.error(err);
    Notiflix.Notify.failure(t('pageError'));
  } finally {
    Notiflix.Loading.remove();
  }
};

// --- FILE HANDLING ---
els.attachBtn.onclick = () => els.fileInput.click();

els.fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  Notiflix.Loading.circle(t('parsing'));
  try {
    let text = "";
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
    } else {
      text = await file.text();
    }
    if (text) {
      currentAttachment = { name: file.name, content: text };
      els.fileName.textContent = file.name;
      els.attachmentPreview.classList.add("active");
      Notiflix.Notify.success(t('fileAttached'));
    }
  } catch(err) {
    Notiflix.Notify.failure(t('errorRead'));
  } finally {
    Notiflix.Loading.remove();
    els.fileInput.value = "";
  }
};

els.removeFileBtn.onclick = () => {
  currentAttachment = null;
  els.attachmentPreview.classList.remove("active");
};

// --- CHAT RENDER ---
function renderMessages() {
  els.messagesList.innerHTML = "";
  
  if (chats.length === 0) {
    els.messagesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm2-5a2 2 0 1 0-4 0h4z"/></svg></div>
        <h2>${t('welcomeTitle')}</h2>
        <p>${t('welcomeText')}</p>
      </div>`;
    return;
  }

  chats.forEach(msg => {
    const row = document.createElement("div");
    row.className = `msg-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`;
    
    const avatar = document.createElement("div");
    avatar.className = `avatar ${msg.role === 'user' ? 'user' : 'ai'}`;
    avatar.innerHTML = msg.role === 'user' 
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>`;

    const content = document.createElement("div");
    content.className = "msg-content";
    const name = document.createElement("div");
    name.className = "msg-name";
    name.textContent = msg.role === 'user' ? t('roleUser') : t('roleAI');

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    
    if (msg.role === 'user') {
      bubble.textContent = msg.text;
    } else {
      bubble.innerHTML = marked.parse(msg.text);
      bubble.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));
    }

    content.appendChild(name);
    content.appendChild(bubble);
    
    if(msg.role === 'user') { row.appendChild(content); row.appendChild(avatar); } 
    else { row.appendChild(avatar); row.appendChild(content); }
    
    els.messagesList.appendChild(row);
  });
  
  els.container.scrollTop = els.container.scrollHeight;
}

// --- SENDING ---
els.sendBtn.onclick = sendMessage;
els.promptInput.addEventListener("keydown", (e) => { if(e.key === "Enter") sendMessage(); });
els.promptInput.addEventListener("input", () => { els.sendBtn.disabled = els.promptInput.value.trim() === ""; });

// Smart Paste
els.promptInput.addEventListener('paste', (e) => {
  const pastedText = (e.clipboardData || window.clipboardData).getData('text');
  if (pastedText.length > CONFIG.PASTE_THRESHOLD) {
    e.preventDefault();
    handleSelectedText(pastedText); 
  }
});

async function sendMessage() {
  const text = els.promptInput.value.trim();
  const apiKey = localStorage.getItem("API_KEY");
  
  if (!apiKey) {
    els.settingsModal.classList.add("open");
    return;
  }
  if (!text) return;

  chats.push({ role: 'user', text: text });
  localStorage.setItem("CHAT_MSGS", JSON.stringify(chats));
  renderMessages();
  els.promptInput.value = "";
  els.sendBtn.disabled = true;

  // Add Loading
  const loadingRow = document.createElement("div");
  loadingRow.className = "msg-row ai-row";
  loadingRow.innerHTML = `
    <div class="avatar ai"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg></div>
    <div class="msg-content">
      <div class="msg-name">${t('roleAI')}</div>
      <div class="msg-bubble"><div class="thinking-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>
    </div>`;
  els.messagesList.appendChild(loadingRow);
  els.container.scrollTop = els.container.scrollHeight;

  // Build Prompt
  let fullPrompt = "";
  if (currentAttachment) {
    fullPrompt += `DOCUMENT CONTEXT (${currentAttachment.name}):\n${currentAttachment.content}\n\n`;
  }
  const recentMsgs = chats.slice(-CONFIG.CONTEXT_WINDOW_SIZE);
  recentMsgs.forEach(m => fullPrompt += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}\n`);
  fullPrompt += `User: ${text}\nAssistant:`;

  try {
    const lang = els.languageSelect.value;
    const response = await fetch("https://api.addisassistant.com/api/v1/chat_generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify({ prompt: fullPrompt, target_language: lang })
    });
    const data = await response.json();
    const reply = data?.data?.response_text || "Error.";

    loadingRow.remove();
    chats.push({ role: 'assistant', text: reply });
    localStorage.setItem("CHAT_MSGS", JSON.stringify(chats));
    renderMessages();
  } catch (err) {
    loadingRow.remove();
    Notiflix.Notify.failure("Error: " + err.message);
  }
}

// --- SETTINGS ---
els.openSettingsBtn.onclick = () => els.settingsModal.classList.add("open");
els.closeSettingsBtn.onclick = () => els.settingsModal.classList.remove("open");

els.saveSettingsBtn.onclick = () => {
  const key = els.apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem("API_KEY", key);
    els.apiKeyInput.value = "";
    els.apiKeyInput.style.display = 'none';
    els.apiStatus.classList.add('show');
  }
  localStorage.setItem("LANG", els.languageSelect.value);
  localStorage.setItem("THEME", els.themeSelect.value);
  applyTheme(els.themeSelect.value);
  updateLabels();
  els.settingsModal.classList.remove("open");
  Notiflix.Notify.success(t('settingsSaved'));
};

els.resetApiKey.onclick = () => {
  localStorage.removeItem("API_KEY");
  els.apiStatus.classList.remove('show');
  els.apiKeyInput.style.display = 'block';
  els.apiKeyInput.focus();
};

els.newChatBtn.onclick = () => {
  chats = [];
  currentAttachment = null;
  els.attachmentPreview.classList.remove("active");
  localStorage.removeItem("CHAT_MSGS");
  renderMessages();
};