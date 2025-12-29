let gargaaraaBtn = null;

// --- EXISTING FAB LOGIC ---
document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (!selectedText) {
    removeButton();
    return;
  }

  if (gargaaraaBtn) removeButton();

  const range = selection.getRangeAt(0);
  const rects = range.getClientRects();
  if (rects.length === 0) return;
  const rect = rects[rects.length - 1];

  const btnSize = 32; 
  const gap = 10;     
  const viewportWidth = document.documentElement.clientWidth;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  let top = rect.top + scrollY - btnSize - gap;
  let left = rect.right + scrollX; 

  if (rect.top < (btnSize + gap)) {
    top = rect.bottom + scrollY + gap;
  }

  if ((rect.right + btnSize + gap) > (viewportWidth + scrollX)) {
    left = (viewportWidth + scrollX) - btnSize - gap;
  } else {
    left = rect.right + scrollX - (btnSize / 2);
  }

  createButton(top, left, selectedText);
});

document.addEventListener("mousedown", (event) => {
  if (gargaaraaBtn && !gargaaraaBtn.contains(event.target)) {
    removeButton();
  }
});

function createButton(top, left, text) {
  gargaaraaBtn = document.createElement("div");
  gargaaraaBtn.className = "gargaaraa-fab";
  gargaaraaBtn.style.top = `${top}px`;
  gargaaraaBtn.style.left = `${left}px`;
  
  const iconUrl = chrome.runtime.getURL("icons/icon.png");
  gargaaraaBtn.style.backgroundImage = `url(${iconUrl})`;
  gargaaraaBtn.setAttribute("title", "Ask Gargaaraa");

  gargaaraaBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ action: "open_gargaaraa_fab", text: text });
    removeButton();
  });

  document.body.appendChild(gargaaraaBtn);
  requestAnimationFrame(() => { gargaaraaBtn.classList.add("visible"); });
}

function removeButton() {
  if (gargaaraaBtn) {
    gargaaraaBtn.remove();
    gargaaraaBtn = null;
  }
}

// --- NEW: Handle Citation Scrolling ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scroll_to_citation") {
    const targetId = request.id;
    // Find the element with the matching data attribute
    const element = document.querySelector(`[data-g-id="${targetId}"]`);
    
    if (element) {
      // Smooth scroll to the element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Apply highlight effect
      element.classList.add('gargaaraa-highlight');
      
      // Remove highlight after animation
      setTimeout(() => {
        element.classList.remove('gargaaraa-highlight');
      }, 2500);
      
      sendResponse({ status: "found" });
    } else {
      sendResponse({ status: "not_found" });
    }
  }
});