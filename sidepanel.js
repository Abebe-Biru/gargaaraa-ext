// --- 1. INITIALIZATION & CONFIG ---
pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';

const CONFIG = { CONTEXT_WINDOW_SIZE: 6, TYPING_SPEED: 10, PASTE_THRESHOLD: 500 };
let currentAttachment = null;
let chats = []; 
let sessions = []; 
let activeSessionId = null;

// --- 2. PROMPT TEMPLATES (MAGIC MENU) ---
const PROMPT_TEMPLATES = {
    om: [
        { cmd: "/cuunfi", desc: "Barreeffama kana gabaabsi (Summarize)", val: "Barreeffama kana gabaabsi: " },
        { cmd: "/tarreessi", desc: "Qabxiilee gurguddoo tarreessi (List)", val: "Qabxiilee gurguddoo barreeffama kanaa tarreessi: " },
        { cmd: "/hiiki", desc: "Gara Afaan Oromootti hiiki (Translate)", val: "Barreeffama kana gara Afaan Oromootti hiiki: " },
        { cmd: "/sirreessi", desc: "Dogoggora seera luga sirreessi (Fix)", val: "Dogoggora seera lugaa fi qubeessuu barreeffama kanaa sirreessi: " },
        { cmd: "/ibsi", desc: "Waa'ee kanaa ibsi (Explain)", val: "Waa'ee kanaa bal'inaan ibsi: " }
    ],
    am: [
        { cmd: "/aqla", desc: "ይህንን ጽሑፍ አሳጥረህ አቅርብ (Summarize)", val: "ይህንን ጽሑፍ አሳጥረህ አቅርብ: " },
        { cmd: "/zirzir", desc: "ዋና ዋና ነጥቦችን በዝርዝር አስቀምጥ (List)", val: "የዚህን ጽሑፍ ዋና ዋና ነጥቦች በዝርዝር አስቀምጥ: " },
        { cmd: "/tergum", desc: "ወደ አማርኛ ተርጉም (Translate)", val: "ይህንን ጽሑፍ ወደ አማርኛ ተርጉም: " },
        { cmd: "/arem", desc: "የሰዋሰው ስህተቶችን አርም (Fix)", val: "የዚህን ጽሑፍ የሰዋሰው እና የፊደል ስህተቶች አርም: " },
        { cmd: "/abrara", desc: "ይህንን አብራራ (Explain)", val: "ይህንን ጽንሰ-ሀሳብ በደንብ አብራራ: " }
    ]
};

// --- 3. TRANSLATION DICTIONARY ---
const TRANSLATIONS = {
  am: {
    placeholder: "መልእክት ይጻፉ... (ለትዕዛዝ / ይጠቀሙ)", 
    modalTitle: "መቼቶች", 
    apiKey: "የኤፒአይ ቁልፍ", 
    lang: "የምላሽ ቋንቋ", 
    theme: "ገጽታ", 
    save: "አስቀምጥ", 
    apiConf: "ተስተካክሏል", 
    reset: "ዳግም", 
    powered: "በ Addis AI የተጎለበተ",
    
    tooltipNewChat: "አዲስ ውይይት ጀምር",
    tooltipSettings: "መቼቶች",
    tooltipReadPage: "ይህንን ገጽ ያንብቡ",
    tooltipAttach: "ፋይል አያይዝ",
    tooltipRemoveFile: "ፋይሉን አስወግድ",
    tooltipExport: "ውይይቱን ላክ",
    tooltipSearch: "የቀድሞ ውይይቶች (History)",
    searchPlaceholder: "በታሪክ ውስጥ ፈልግ...",
    
    roleUser: "እርስዎ", 
    roleAI: "ጋርጋራ",
    welcomeTitle: "ሰላም!", 
    welcomeText: "እኔ ጋርጋራ ነኝ። ምን ልርዳዎ?",
    
    fileAttached: "ፋይል ተያይዟል", 
    parsing: "ፋይሉን በማንበብ ላይ...", 
    errorRead: "ፋይሉን ማንበብ አልተቻለም",
    pastedAsFile: "ረጅም ጽሑፍ እንደ ፋይል ተያይዟል", 
    settingsSaved: "መቼቶች ተቀምጠዋል",
    chatCleared: "አዲስ ውይይት ተጀምሯል",
    
    readingPage: "ገጹን በማንበብ ላይ...", 
    readingLinks: "ተያያዥ ሊንኮችን በማንበብ ላይ...",
    pageLoaded: "የገጹ ይዘት ተጭኗል", 
    pageError: "ገጹን ማንበብ አልተቻለም",
    pageEmpty: "ይህ ገጽ ባዶ ነው",
    
    alertKeyMissing: "የኤፒአይ ቁልፍ የለም",
    alertKeyDesc: "እባክዎ መቼቶች ውስጥ የኤፒአይ ቁልፍ ያስገቡ።",
    alertKeyResetTitle: "ኤፒአይ ቁልፍን ዳግም አስጀምር",
    alertKeyResetText: "ይህ የአሁኑን ቁልፍ ያስወግዳል።",
    alertDelTitle: "ውይይቱን ሰርዝ",
    alertDelText: "ይህን ታሪክ መሰረዝ ይፈልጋሉ?",
    
    exportTitle: "ውይይቱን ላክ",
    exportDesc: "እንዴት መላክ ይፈልጋሉ?",
    btnPdf: "እንደ PDF",
    btnMd: "እንደ Markdown",
    
    btnYes: "አዎ", 
    btnCancel: "ይቅር", 
    btnDelete: "ሰርዝ", 
    networkError: "የኔትወርክ ችግር አጋጥሟል",
    scrolledTo: "ወደ ምንጩ ተንቀሳቅሷል",
    newChatTitle: "አዲስ ውይይት"
  },
  om: {
    placeholder: "Ergaa barreessi... (Ajajaaf / fayyadami)", 
    modalTitle: "Qindaa'ina", 
    apiKey: "Furtuu API", 
    lang: "Afaan Deebii", 
    theme: "Bifa", 
    save: "Kuusi", 
    apiConf: "Sirreeffameera", 
    reset: "Haqi", 
    powered: "Addis AI dhaan deeggarame",

    tooltipNewChat: "Haasaa haaraa jalqabi",
    tooltipSettings: "Qindaa'ina ban",
    tooltipReadPage: "Fuula kana dubbisi",
    tooltipAttach: "Faayilii qabsiisi",
    tooltipRemoveFile: "Faayilii haqi",
    tooltipExport: "Haasaa gadi-buusi",
    tooltipSearch: "Seenaa Haasaa (History)",
    searchPlaceholder: "Seenaa keessa barbaadi...",

    roleUser: "Isin", 
    roleAI: "Gargaaraa",
    welcomeTitle: "Akkam!", 
    welcomeText: "Ani Gargaaraa dha. Maal si gargaaru?",

    fileAttached: "Faayiliin qabsiifameera", 
    parsing: "Dubbisaa jira...", 
    errorRead: "Faayilii dubbisuu hin dandeenye",
    pastedAsFile: "Barreeffamni dheeraan qabsiifameera", 
    settingsSaved: "Qindaa'inni kusameera",
    chatCleared: "Haasaan haaraan jalqabameera",

    readingPage: "Fuula dubbisaa jira...", 
    readingLinks: "Geessituuwwan walqabatan dubbisaa...",
    pageLoaded: "Qabiyyeen fuulichaa fe'ameera", 
    pageError: "Fuula dubbisuu hin dandeenye",
    pageEmpty: "Fuulli kun duwwaa dha",

    alertKeyMissing: "Furtuun API hin jiru",
    alertKeyDesc: "Maaloo Furtuu API galchi.",
    alertKeyResetTitle: "Furtuu API Haqi",
    alertKeyResetText: "Kuni Furtuu API ni haqa.",
    alertDelTitle: "Haasaa Haqi",
    alertDelText: "Seenaa kana haqquu barbaaddaa?",

    exportTitle: "Haasaa Gadi-buusi",
    exportDesc: "Akkaamiin gadi-buusuu barbaadda?",
    btnPdf: "Akka PDF",
    btnMd: "Akka Markdown",

    btnYes: "Eeyyee", 
    btnCancel: "Dhiisi", 
    btnDelete: "Haqi", 
    networkError: "Rakkoo neetworkii",
    scrolledTo: "Madda isaa agarsiisaa jira",
    newChatTitle: "Haasaa Haaraa"
  }
};

function t(key) {
  const lang = document.getElementById("languageSelect").value || 'om';
  return TRANSLATIONS[lang][key] || TRANSLATIONS['om'][key] || key; 
}

// --- DOM ELEMENTS ---
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
  // Search & History
  exportChatBtn: document.getElementById("exportChatBtn"),
  toggleSearchBtn: document.getElementById("toggleSearchBtn"),
  historyOverlay: document.getElementById("historyOverlay"),
  historyList: document.getElementById("historyList"),
  historySearchInput: document.getElementById("historySearchInput"),
  // Magic Menu
  promptMenu: document.getElementById("promptMenu"),
  
  lblModalTitle: document.getElementById("lbl-modalTitle"),
  lblApiKey: document.getElementById("lbl-apiKey"),
  lblLang: document.getElementById("lbl-lang"),
  lblTheme: document.getElementById("lbl-theme"),
  lblApiConf: document.getElementById("lbl-apiConf"),
  lblPowered: document.getElementById("lbl-powered")
};

// --- INIT ---
Notiflix.Notify.init({ position: 'right-top', borderRadius: '8px', fontFamily: 'Inter', useIcon: true });
Notiflix.Confirm.init({ borderRadius: '12px', titleColor: '#4f46e5', okButtonBackground: '#4f46e5', fontFamily: 'Inter', useGoogleFont: false });

document.addEventListener('DOMContentLoaded', async () => {
  els.app.classList.add('loaded');
  
  const key = localStorage.getItem("API_KEY");
  if(key) {
    els.apiKeyInput.style.display = 'none';
    els.apiStatus.classList.add('show');
  }
  els.languageSelect.value = localStorage.getItem("LANG") || "om";
  els.themeSelect.value = localStorage.getItem("THEME") || "light";
  applyTheme(els.themeSelect.value);
  updateLabels();

  sessions = JSON.parse(localStorage.getItem("CHAT_SESSIONS")) || [];
  const legacyChats = JSON.parse(localStorage.getItem("CHAT_MSGS"));
  if (legacyChats && legacyChats.length > 0 && sessions.length === 0) {
     const newId = Date.now().toString();
     sessions.push({ id: newId, title: "Previous Chat", timestamp: Date.now(), messages: legacyChats });
     localStorage.setItem("CHAT_SESSIONS", JSON.stringify(sessions));
     localStorage.removeItem("CHAT_MSGS");
     activeSessionId = newId;
     chats = legacyChats;
  } else if (sessions.length > 0) {
      const lastSession = sessions[0];
      activeSessionId = lastSession.id;
      chats = lastSession.messages;
  } else {
      createNewSessionId();
  }

  renderMessages();

  const data = await chrome.storage.local.get("pendingSelection");
  if (data.pendingSelection) {
    handleSelectedText(data.pendingSelection);
    chrome.storage.local.remove("pendingSelection");
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.pendingSelection) {
    const newText = changes.pendingSelection.newValue;
    if (newText) {
      handleSelectedText(newText);
      chrome.storage.local.remove("pendingSelection");
    }
  }
});

// --- HELPER: UPDATE SEND BUTTON STATE ---
function updateSendButtonState() {
    const val = els.promptInput.value.trim();
    // Enable if there is text OR if the user is typing a command (e.g., "/")
    els.sendBtn.disabled = val.length === 0;
}

// --- PROMPT MENU LOGIC (MAGIC MENU) ---
let selectedPromptIndex = -1;

els.promptInput.addEventListener('input', (e) => {
  const val = e.target.value;
  updateSendButtonState(); // Update button state on input

  // Check if input starts with '/'
  if (val.startsWith('/')) {
    const lang = els.languageSelect.value || 'om';
    const templates = PROMPT_TEMPLATES[lang] || PROMPT_TEMPLATES['om'];
    
    const query = val.substring(1).toLowerCase();
    const filtered = templates.filter(t => t.cmd.toLowerCase().includes(query));

    if (filtered.length > 0) {
      renderPromptMenu(filtered);
    } else {
      closePromptMenu();
    }
  } else {
    closePromptMenu();
  }
});

// --- KEYBOARD NAVIGATION & ENTER ---
els.promptInput.addEventListener('keydown', (e) => {
  if (e.isComposing) return; 

  const menuActive = els.promptMenu.classList.contains('active');
  
  if (menuActive) {
    const items = els.promptMenu.querySelectorAll('.prompt-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedPromptIndex = (selectedPromptIndex + 1) % items.length;
      updatePromptSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedPromptIndex = (selectedPromptIndex - 1 + items.length) % items.length;
      updatePromptSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); 
      if (selectedPromptIndex >= 0 && items[selectedPromptIndex]) {
        items[selectedPromptIndex].click();
      }
    } else if (e.key === 'Escape') {
      closePromptMenu();
    }
  } else {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }
});

function closePromptMenu() {
    els.promptMenu.classList.remove('active');
    selectedPromptIndex = -1;
}

function renderPromptMenu(items) {
  els.promptMenu.innerHTML = "";
  selectedPromptIndex = 0; 

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `prompt-item ${index === 0 ? 'selected' : ''}`;
    div.innerHTML = `<span class="prompt-cmd">${item.cmd}</span><span class="prompt-desc">${item.desc}</span>`;
    
    div.onclick = () => {
      els.promptInput.value = item.val;
      closePromptMenu();
      updateSendButtonState();
      els.promptInput.focus();
      els.promptInput.selectionStart = els.promptInput.selectionEnd = els.promptInput.value.length;
    };
    
    els.promptMenu.appendChild(div);
  });
  
  els.promptMenu.classList.add('active');
}

function updatePromptSelection(items) {
  items.forEach((item, idx) => {
    if (idx === selectedPromptIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

// --- SESSION MANAGEMENT ---
function createNewSessionId() {
    activeSessionId = Date.now().toString();
    chats = [];
    currentAttachment = null;
    els.attachmentPreview.classList.remove("active");
    saveSession();
}

function saveSession() {
    const index = sessions.findIndex(s => s.id === activeSessionId);
    let title = t('newChatTitle');
    const firstMsg = chats.find(m => m.role === 'user');
    if (firstMsg) {
        title = firstMsg.text.substring(0, 30) + (firstMsg.text.length > 30 ? "..." : "");
    }
    const sessionData = { id: activeSessionId, title: title, timestamp: Date.now(), messages: chats };

    if (index > -1) { sessions[index] = sessionData; } 
    else { if(chats.length > 0) sessions.unshift(sessionData); }
    
    sessions.sort((a,b) => b.timestamp - a.timestamp);
    localStorage.setItem("CHAT_SESSIONS", JSON.stringify(sessions));
}

function loadSession(id) {
    const session = sessions.find(s => s.id === id);
    if(session) {
        activeSessionId = session.id;
        chats = session.messages;
        currentAttachment = null;
        els.attachmentPreview.classList.remove("active");
        renderMessages();
        els.historyOverlay.classList.remove("open");
        els.toggleSearchBtn.classList.remove("active");
    }
}

function deleteSession(id, event) {
    event.stopPropagation();
    Notiflix.Confirm.show(t('alertDelTitle'), t('alertDelText'), t('btnDelete'), t('btnCancel'), () => {
        sessions = sessions.filter(s => s.id !== id);
        localStorage.setItem("CHAT_SESSIONS", JSON.stringify(sessions));
        if(id === activeSessionId) { createNewSessionId(); renderMessages(); }
        renderHistoryList(els.historySearchInput.value);
    }, null, { okButtonBackground: '#ef4444' });
}

// --- HISTORY OVERLAY ---
els.toggleSearchBtn.onclick = () => {
  const isOpen = els.historyOverlay.classList.contains('open');
  if (isOpen) {
    els.historyOverlay.classList.remove('open');
    els.toggleSearchBtn.classList.remove('active');
  } else {
    els.historyOverlay.classList.add('open');
    els.toggleSearchBtn.classList.add('active');
    renderHistoryList();
    setTimeout(() => els.historySearchInput.focus(), 100);
  }
};

els.historySearchInput.addEventListener('input', (e) => { renderHistoryList(e.target.value); });

function renderHistoryList(query = "") {
    els.historyList.innerHTML = "";
    const lowerQ = query.toLowerCase();
    const filtered = sessions.filter(s => {
        if(!query) return true;
        const inTitle = s.title.toLowerCase().includes(lowerQ);
        const inMsg = s.messages.some(m => m.text.toLowerCase().includes(lowerQ));
        return inTitle || inMsg;
    });

    if(filtered.length === 0) {
        els.historyList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">No chats found.</div>`;
        return;
    }

    filtered.forEach(s => {
        const item = document.createElement("div");
        item.className = `history-item ${s.id === activeSessionId ? 'active' : ''}`;
        const dateStr = new Date(s.timestamp).toLocaleDateString();
        item.innerHTML = `
            <div class="history-title">${s.title}</div>
            <div class="history-meta">
                <span>${dateStr}</span>
                <button class="delete-chat-btn" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        item.onclick = () => loadSession(s.id);
        item.querySelector('.delete-chat-btn').onclick = (e) => deleteSession(s.id, e);
        els.historyList.appendChild(item);
    });
}

els.newChatBtn.onclick = () => {
    if (chats.length === 0) { els.promptInput.focus(); return; }
    saveSession();
    createNewSessionId();
    renderMessages();
    Notiflix.Notify.success(t('chatCleared'));
};

// --- FAIL-SAFE CITATION SCROLL ---
els.messagesList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('citation-btn')) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "scroll_to_citation", id: id }, (response) => {
        if (chrome.runtime.lastError || !response) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (targetId) => {
                    const element = document.querySelector(`[data-g-id="${targetId}"]`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const originalBg = element.style.backgroundColor;
                        const originalTrans = element.style.transition;
                        element.style.transition = "background-color 2s ease-out";
                        element.style.backgroundColor = "rgba(255, 255, 0, 0.5)";
                        setTimeout(() => {
                            element.style.backgroundColor = originalBg;
                            element.style.transition = originalTrans;
                        }, 2500);
                        return "found";
                    }
                    return "not_found";
                },
                args: [id]
            }).then((results) => {
                if(results && results[0] && results[0].result === 'found') {
                    Notiflix.Notify.info(t('scrolledTo') + ` [${id}]`);
                }
            });
        } else if (response.status === 'found') {
          Notiflix.Notify.info(t('scrolledTo') + ` [${id}]`);
        }
      });
    }
  }
});

els.exportChatBtn.onclick = () => {
  if (chats.length === 0) return;
  Notiflix.Confirm.show(t('exportTitle'), t('exportDesc'), t('btnPdf'), t('btnMd'), 
    () => { window.print(); }, 
    () => { exportToMarkdown(); }, 
    { okButtonBackground: '#4f46e5', cancelButtonBackground: '#0f172a' }
  );
};

function exportToMarkdown() {
  let mdContent = `# Gargaaraa Chat History\nDate: ${new Date().toLocaleString()}\n\n`;
  chats.forEach(msg => {
    const role = msg.role === 'user' ? 'User' : 'Gargaaraa';
    mdContent += `### ${role}\n${msg.text}\n\n---\n\n`;
  });
  const blob = new Blob([mdContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gargaaraa-chat-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function updateLabels() {
  els.promptInput.placeholder = t('placeholder');
  els.lblModalTitle.textContent = t('modalTitle');
  els.lblApiKey.textContent = t('apiKey');
  els.lblLang.textContent = t('lang');
  els.lblTheme.textContent = t('theme');
  els.saveSettingsBtn.textContent = t('save');
  els.lblApiConf.textContent = t('apiConf');
  els.resetApiKey.textContent = t('reset');
  if(els.lblPowered) els.lblPowered.textContent = t('powered');

  els.newChatBtn.title = t('tooltipNewChat');
  els.openSettingsBtn.title = t('tooltipSettings');
  els.readPageBtn.title = t('tooltipReadPage');
  els.attachBtn.title = t('tooltipAttach');
  els.removeFileBtn.title = t('tooltipRemoveFile');
  els.exportChatBtn.title = t('tooltipExport');
  els.toggleSearchBtn.title = t('tooltipSearch');
  els.historySearchInput.placeholder = t('searchPlaceholder');

  renderMessages();
}

function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  const isDark = theme === 'dark';
  Notiflix.Notify.merge({ background: isDark ? '#1e293b' : '#fff', textColor: isDark ? '#fff' : '#000' });
  Notiflix.Confirm.merge({ backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: isDark ? '#818cf8' : '#4f46e5', messageColor: isDark ? '#cbd5e1' : '#1e293b' });
}

function handleSelectedText(text) {
  if (!text) return;
  currentAttachment = { name: "selection.txt", content: text };
  els.fileName.textContent = "selection.txt";
  els.attachmentPreview.classList.add("active");
  Notiflix.Notify.success(t("Kan filatame fe'ameera")); 
  els.promptInput.focus();
}

els.readPageBtn.onclick = async () => {
  Notiflix.Loading.circle(t('readingPage'));
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error("No active tab");

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        let idCounter = 1;
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
        let contextText = "";
        elements.forEach(el => {
           const text = el.innerText.trim();
           if(text.length > 20 && el.offsetParent !== null) { 
              el.setAttribute('data-g-id', idCounter);
              contextText += `[ID: ${idCounter}] ${text}\n\n`;
              idCounter++;
           }
        });
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(href => href.startsWith('http') && href.length > 25)
          .filter((v, i, a) => a.indexOf(v) === i);
        return { text: contextText, links: links.slice(0, 3) };
      }
    });

    const { text: chunkedText, links } = result[0].result;
    if (!chunkedText || chunkedText.length < 50) throw new Error(t('pageEmpty'));

    Notiflix.Loading.change(t('readingLinks'));
    const subPagesContent = await Promise.all(
      links.map(async (link) => {
        const content = await fetchAndCleanUrl(link);
        return content ? `\n\n--- LINKED CONTENT (${link}) ---\n${content}` : "";
      })
    );

    const combinedText = `MAIN PAGE CONTENT (Use [ID] for citations):\n${chunkedText.substring(0, 15000)}\n` + subPagesContent.join("");
    const title = tab.title || "Webpage";
    currentAttachment = { name: `Web: ${title.substring(0, 10)}... (+${links.length})`, content: combinedText };
    els.fileName.textContent = currentAttachment.name;
    els.attachmentPreview.classList.add("active");
    Notiflix.Notify.success(t('pageLoaded'));
  } catch (err) { Notiflix.Notify.failure(t('pageError')); } finally { Notiflix.Loading.remove(); }
};

async function fetchAndCleanUrl(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const trash = doc.querySelectorAll('script, style, noscript, svg, img, iframe, nav, footer, header');
    trash.forEach(el => el.remove());
    let text = doc.body.innerText;
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    return text.substring(0, 3000);
  } catch (e) { return ""; }
}

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
    } else { text = await file.text(); }
    if (text) {
      currentAttachment = { name: file.name, content: text };
      els.fileName.textContent = file.name;
      els.attachmentPreview.classList.add("active");
      Notiflix.Notify.success(t('fileAttached'));
    }
  } catch(err) { Notiflix.Notify.failure(t('errorRead')); } finally { Notiflix.Loading.remove(); els.fileInput.value = ""; }
};
els.removeFileBtn.onclick = () => { currentAttachment = null; els.attachmentPreview.classList.remove("active"); };

function renderMessages() {
  els.messagesList.innerHTML = "";
  if (chats.length === 0) {
    els.messagesList.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm2-5a2 2 0 1 0-4 0h4z"/></svg></div><h2>${t('welcomeTitle')}</h2><p>${t('welcomeText')}</p></div>`;
    return;
  }
  chats.forEach(msg => {
    const row = document.createElement("div");
    row.className = `msg-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`;
    const avatar = document.createElement("div");
    avatar.className = `avatar ${msg.role === 'user' ? 'user' : 'ai'}`;
    avatar.innerHTML = msg.role === 'user' ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>`;
    const content = document.createElement("div");
    content.className = "msg-content";
    const name = document.createElement("div");
    name.className = "msg-name";
    name.textContent = msg.role === 'user' ? t('roleUser') : t('roleAI');
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    if (msg.role === 'user') { bubble.textContent = msg.text; } 
    else {
      let rawHtml = marked.parse(msg.text);
      rawHtml = rawHtml.replace(/\[\s*([\d\s,]+)\s*\]/g, (match, group) => {
          if (!/^[\d\s,]+$/.test(group)) return match; 
          const nums = group.split(',').map(n => n.trim()).filter(n => n);
          return nums.map(num => `<button class="citation-btn" data-id="${num}" title="Jump to section ${num}">[${num}]</button>`).join(' ');
      });
      bubble.innerHTML = rawHtml;
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

// --- SEND MESSAGE LOGIC (Updated to fix button) ---
els.sendBtn.onclick = () => {
    // Force close menu if user clicks send
    closePromptMenu();
    sendMessage();
};

async function sendMessage() {
  const text = els.promptInput.value.trim();
  const apiKey = localStorage.getItem("API_KEY");
  if (!apiKey) {
    Notiflix.Report.warning(t('alertKeyMissing'), t('alertKeyDesc'), t('modalTitle'), () => { els.settingsModal.classList.add("open"); setTimeout(() => els.apiKeyInput.focus(), 200); });
    return;
  }
  if (!text) return;
  
  chats.push({ role: 'user', text: text });
  saveSession();
  renderMessages();
  els.promptInput.value = "";
  updateSendButtonState();
  els.sendBtn.disabled = true;

  const loadingRow = document.createElement("div");
  loadingRow.className = "msg-row ai-row";
  loadingRow.innerHTML = `<div class="avatar ai"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg></div><div class="msg-content"><div class="msg-name">${t('roleAI')}</div><div class="msg-bubble"><div class="thinking-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div></div>`;
  els.messagesList.appendChild(loadingRow);
  els.container.scrollTop = els.container.scrollHeight;

  let fullPrompt = "";
  let systemInst = "You are a helpful assistant.";
  if (currentAttachment && currentAttachment.name.startsWith("Web:")) {
      systemInst += " The user has provided web content labeled with IDs like [ID: 1]. Use this content to answer. IMPORTANT: When you use information from a specific chunk, append the citation number [x] to the sentence. Example: 'The sky is blue [1] and grass is green [2].' You can cite multiple sections like [1, 2].";
  }
  if (currentAttachment) { fullPrompt += `SYSTEM: ${systemInst}\n\nDOCUMENT CONTEXT (${currentAttachment.name}):\n${currentAttachment.content}\n\n`; } 
  else { fullPrompt += `SYSTEM: ${systemInst}\n\n`; }

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
    saveSession(); 
    renderMessages();
  } catch (err) { loadingRow.remove(); Notiflix.Notify.failure(t('networkError')); }
}

els.openSettingsBtn.onclick = () => els.settingsModal.classList.add("open");
els.closeSettingsBtn.onclick = () => els.settingsModal.classList.remove("open");
els.saveSettingsBtn.onclick = () => {
  const key = els.apiKeyInput.value.trim();
  if (key) { localStorage.setItem("API_KEY", key); els.apiKeyInput.value = ""; els.apiKeyInput.style.display = 'none'; els.apiStatus.classList.add('show'); }
  localStorage.setItem("LANG", els.languageSelect.value);
  localStorage.setItem("THEME", els.themeSelect.value);
  applyTheme(els.themeSelect.value);
  updateLabels();
  els.settingsModal.classList.remove("open");
  Notiflix.Notify.success(t('settingsSaved'));
};
els.resetApiKey.onclick = () => {
  Notiflix.Confirm.show(t('alertKeyResetTitle'), t('alertKeyResetText'), t('btnYes'), t('btnCancel'), () => { localStorage.removeItem("API_KEY"); els.apiStatus.classList.remove('show'); els.apiKeyInput.style.display = 'block'; els.apiKeyInput.focus(); });
};