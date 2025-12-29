// --- 1. INITIALIZATION & CONFIG ---
pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';

const CONFIG = { CONTEXT_WINDOW_SIZE: 6, TYPING_SPEED: 10, PASTE_THRESHOLD: 500 };
let currentAttachment = null;
let chats = []; 

// --- 2. TRANSLATION DICTIONARY ---
const TRANSLATIONS = {
  am: {
    placeholder: "መልእክት ይጻፉ...", 
    modalTitle: "መቼቶች", 
    apiKey: "የኤፒአይ ቁልፍ", 
    lang: "የምላሽ ቋንቋ", 
    theme: "ገጽታ", 
    save: "አስቀምጥ", 
    apiConf: "ተስተካክሏል", 
    reset: "ዳግም",
    powered: "በ Addis AI የተጎለበተ",
    
    // Tooltips
    tooltipNewChat: "አዲስ ውይይት ጀምር",
    tooltipSettings: "መቼቶች",
    tooltipReadPage: "ይህንን ገጽ ያንብቡ (Chat with Page)",
    tooltipAttach: "ፋይል አያይዝ (PDF/TXT)",
    tooltipRemoveFile: "ፋይሉን አስወግድ",
    tooltipExport: "ውይይቱን ላክ (Export)",
    tooltipSearch: "ፈልግ",
    searchPlaceholder: "በውይይቱ ውስጥ ፈልግ...",
    
    // Chat Roles
    roleUser: "እርስዎ", 
    roleAI: "ጋርጋራ",
    welcomeTitle: "ሰላም!", 
    welcomeText: "እኔ ጋርጋራ ነኝ። ምን ልርዳዎ?",
    
    // Status
    fileAttached: "ፋይል ተያይዟል", 
    parsing: "ፋይሉን በማንበብ ላይ...", 
    errorRead: "ፋይሉን ማንበብ አልተቻለም",
    pastedAsFile: "ረጅም ጽሑፍ እንደ ፋይል ተያይዟል", 
    settingsSaved: "መቼቶች ተቀምጠዋል",
    chatCleared: "ውይይቱ ጸድቷል",
    
    // Page Reading
    readingPage: "ገጹን በማንበብ ላይ...", 
    readingLinks: "ተያያዥ ሊንኮችን በማንበብ ላይ...",
    pageLoaded: "የገጹ ይዘት ተጭኗል", 
    pageError: "ገጹን ማንበብ አልተቻለም (የደህንነት ገደብ)",
    pageEmpty: "ይህ ገጽ ባዶ ነው ወይም ሊነበብ አልቻለም",
    
    // Alerts
    alertKeyMissing: "የኤፒአይ ቁልፍ የለም",
    alertKeyDesc: "እባክዎ ለመወያየት በመቼቶች ውስጥ የኤፒአይ ቁልፍ ያስገቡ።",
    alertKeySaved: "የኤፒአይ ቁልፍ ተቀምጧል",
    alertKeyResetTitle: "ኤፒአይ ቁልፍን ዳግም አስጀምር",
    alertKeyResetText: "ይህ የአሁኑን የኤፒአይ ቁልፍ ያስወግዳል። መቀጠል ይፈልጋሉ?",
    alertDelTitle: "ውይይቱን ሰርዝ",
    alertDelText: "ይህን ውይይት መሰረዝ ይፈልጋሉ?",
    alertDelSuccess: "ውይይቱ ተሰርዟል",
    
    // Export Prompts
    exportTitle: "ውይይቱን ላክ",
    exportDesc: "እንዴት መላክ ይፈልጋሉ?",
    btnPdf: "እንደ PDF (Print)",
    btnMd: "እንደ Markdown",
    
    btnYes: "አዎ", 
    btnCancel: "ይቅር",
    btnDelete: "ሰርዝ",
    networkError: "የኔትወርክ ችግር አጋጥሟል",
    scrolledTo: "ወደ ምንጩ ተንቀሳቅሷል"
  },
  om: {
    placeholder: "Ergaa barreessi...", 
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
    tooltipReadPage: "Fuula kana dubbisi (Chat with Page)",
    tooltipAttach: "Faayilii qabsiisi (PDF/TXT)",
    tooltipRemoveFile: "Faayilii haqi",
    tooltipExport: "Haasaa gadi-buusi (Export)",
    tooltipSearch: "Barbaadi",
    searchPlaceholder: "Haasaa keessa barbaadi...",

    roleUser: "Isin", 
    roleAI: "Gargaaraa",
    welcomeTitle: "Akkam!", 
    welcomeText: "Ani Gargaaraa dha. Maal si gargaaru?",

    fileAttached: "Faayiliin qabsiifameera", 
    parsing: "Dubbisaa jira...", 
    errorRead: "Faayilii dubbisuu hin dandeenye",
    pastedAsFile: "Barreeffamni dheeraan qabsiifameera", 
    settingsSaved: "Qindaa'inni kusameera",
    chatCleared: "Haasaan haqameera",

    readingPage: "Fuula dubbisaa jira...", 
    readingLinks: "Geessituuwwan walqabatan dubbisaa...",
    pageLoaded: "Qabiyyeen fuulichaa fe'ameera", 
    pageError: "Fuula dubbisuu hin dandeenye (Eegumsa)",
    pageEmpty: "Fuulli kun duwwaa dha yookiin dubbisuun hin danda'amne",

    alertKeyMissing: "Furtuun API hin jiru",
    alertKeyDesc: "Maaloo haasaa jalqabuuf qindaa'ina keessa Furtuu API galchi.",
    alertKeySaved: "Furtuun API kusameera",
    alertKeyResetTitle: "Furtuu API Haqi",
    alertKeyResetText: "Kuni Furtuu API amma irra jiru ni haqa. Itti fufuu?",
    alertDelTitle: "Haasaa Haqi",
    alertDelText: "Haasaa kana haqquu barbaaddaa?",
    alertDelSuccess: "Haasaan haqameera",

    exportTitle: "Haasaa Gadi-buusi",
    exportDesc: "Akkaamiin gadi-buusuu barbaadda?",
    btnPdf: "Akka PDF (Print)",
    btnMd: "Akka Markdown",

    btnYes: "Eeyyee", 
    btnCancel: "Dhiisi",
    btnDelete: "Haqi",
    networkError: "Rakkoo neetworkii",
    scrolledTo: "Madda isaa agarsiisaa jira"
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
  // Search & Export Elements
  exportChatBtn: document.getElementById("exportChatBtn"),
  toggleSearchBtn: document.getElementById("toggleSearchBtn"),
  searchBarContainer: document.getElementById("searchBarContainer"),
  searchInput: document.getElementById("searchInput"),
  
  lblModalTitle: document.getElementById("lbl-modalTitle"),
  lblApiKey: document.getElementById("lbl-apiKey"),
  lblLang: document.getElementById("lbl-lang"),
  lblTheme: document.getElementById("lbl-theme"),
  lblApiConf: document.getElementById("lbl-apiConf"),
  lblPowered: document.getElementById("lbl-powered")
};

// --- NOTIFLIX INIT ---
Notiflix.Notify.init({ position: 'right-top', borderRadius: '8px', fontFamily: 'Inter', useIcon: true });
Notiflix.Confirm.init({ borderRadius: '12px', titleColor: '#4f46e5', okButtonBackground: '#4f46e5', fontFamily: 'Inter', useGoogleFont: false });
Notiflix.Report.init({ borderRadius: '12px', fontFamily: 'Inter' });

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
  els.app.classList.add('loaded');
  
  // Load API Key State
  const key = localStorage.getItem("API_KEY");
  if(key) {
    els.apiKeyInput.style.display = 'none';
    els.apiStatus.classList.add('show');
  }
  
  // Load Preferences
  els.languageSelect.value = localStorage.getItem("LANG") || "om";
  els.themeSelect.value = localStorage.getItem("THEME") || "light";
  
  applyTheme(els.themeSelect.value);
  updateLabels();

  // Load Chat
  chats = JSON.parse(localStorage.getItem("CHAT_MSGS")) || [];
  renderMessages();

  // Check for Context from Background (Right Click)
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

// --- CITATION CLICK HANDLER (UPDATED) ---
els.messagesList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('citation-btn')) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "scroll_to_citation", id: id }, (response) => {
        if (response && response.status === 'found') {
          Notiflix.Notify.info(t('scrolledTo') + ` [${id}]`);
        }
      });
    }
  }
});

// --- SEARCH FEATURE ---
els.toggleSearchBtn.onclick = () => {
  const isOpen = els.searchBarContainer.classList.contains('open');
  if (isOpen) {
    els.searchBarContainer.classList.remove('open');
    els.searchInput.value = "";
    filterMessages(""); 
  } else {
    els.searchBarContainer.classList.add('open');
    setTimeout(() => els.searchInput.focus(), 200);
  }
};

els.searchInput.addEventListener('input', (e) => {
  filterMessages(e.target.value);
});

function filterMessages(query) {
  const rows = document.querySelectorAll('.msg-row');
  const lowerQuery = query.toLowerCase().trim();
  
  rows.forEach(row => {
    if(!lowerQuery) {
      row.classList.remove('hidden');
    } else {
      const text = row.innerText.toLowerCase();
      if(text.includes(lowerQuery)) row.classList.remove('hidden');
      else row.classList.add('hidden');
    }
  });
}

// --- EXPORT FEATURE ---
els.exportChatBtn.onclick = () => {
  if (chats.length === 0) return;
  
  Notiflix.Confirm.show(
    t('exportTitle'),
    t('exportDesc'),
    t('btnPdf'),
    t('btnMd'),
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

// --- LABELS & THEME ---
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
  els.searchInput.placeholder = t('searchPlaceholder');

  renderMessages();
}

function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  
  const isDark = theme === 'dark';
  Notiflix.Notify.merge({ background: isDark ? '#1e293b' : '#fff', textColor: isDark ? '#fff' : '#000' });
  Notiflix.Confirm.merge({ 
    backgroundColor: isDark ? '#1e293b' : '#fff', 
    titleColor: isDark ? '#818cf8' : '#4f46e5', 
    messageColor: isDark ? '#cbd5e1' : '#1e293b' 
  });
}

// --- CORE LOGIC ---
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

    // TAGGING DOM ELEMENTS LOGIC
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        let idCounter = 1;
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');
        let contextText = "";
        
        elements.forEach(el => {
           const text = el.innerText.trim();
           if(text.length > 20 && el.offsetParent !== null) { 
              el.setAttribute('data-g-id', idCounter); // Inject ID
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

  } catch (err) {
    Notiflix.Notify.failure(t('pageError'));
  } finally {
    Notiflix.Loading.remove();
  }
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

els.removeFileBtn.onclick = () => {
  currentAttachment = null;
  els.attachmentPreview.classList.remove("active");
};

// --- CHAT RENDER (FIXED CITATION REGEX) ---
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
      
      // FIXED REGEX: Matches [1], [1, 2], [1, 2, 3] and handles spacing
      rawHtml = rawHtml.replace(/\[\s*([\d\s,]+)\s*\]/g, (match, group) => {
          if (!/^[\d\s,]+$/.test(group)) return match; // Safety check
          
          // Split numbers and create a button for each
          const nums = group.split(',').map(n => n.trim()).filter(n => n);
          return nums.map(num => 
              `<button class="citation-btn" data-id="${num}" title="Jump to section ${num}">[${num}]</button>`
          ).join(' ');
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

els.sendBtn.onclick = sendMessage;
els.promptInput.addEventListener("keydown", (e) => { if(e.key === "Enter") sendMessage(); });
els.promptInput.addEventListener("input", () => { els.sendBtn.disabled = els.promptInput.value.trim() === ""; });
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
    Notiflix.Report.warning(t('alertKeyMissing'), t('alertKeyDesc'), t('modalTitle'), () => { els.settingsModal.classList.add("open"); setTimeout(() => els.apiKeyInput.focus(), 200); });
    return;
  }
  if (!text) return;
  chats.push({ role: 'user', text: text });
  localStorage.setItem("CHAT_MSGS", JSON.stringify(chats));
  renderMessages();
  els.promptInput.value = "";
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
    localStorage.setItem("CHAT_MSGS", JSON.stringify(chats));
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
els.newChatBtn.onclick = () => {
  Notiflix.Confirm.show(t('alertDelTitle'), t('alertDelText'), t('btnDelete'), t('btnCancel'), () => { chats = []; currentAttachment = null; els.attachmentPreview.classList.remove("active"); localStorage.removeItem("CHAT_MSGS"); renderMessages(); Notiflix.Notify.info(t('chatCleared')); }, null, { okButtonBackground: '#ef4444' });
};