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

// --- NEW: CITATION SCROLLING LOGIC ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scroll_to_text") {
    findAndScroll(request.text);
  }
});

function findAndScroll(textSnippet) {
  if (!textSnippet) return;

  // 1. Prepare search string (take first 60 chars to avoid whitespace mismatches across long blocks)
  // We clean it to ensure correct matching
  const searchStr = textSnippet.replace(/\s+/g, ' ').trim().substring(0, 60);

  // 2. Clear previous highlights
  document.querySelectorAll('.gargaaraa-citation-highlight').forEach(el => {
    el.classList.remove('gargaaraa-citation-highlight');
  });

  // 3. Use window.find to locate text
  // Reset selection
  window.getSelection().removeAllRanges();
  
  // (aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog)
  // Using fuzzy-ish find logic via window.find which is robust for this use case
  const found = window.find(searchStr, false, false, true, false, true, false);

  if (found) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let element = range.startContainer;
      
      // Navigate up if text node
      if (element.nodeType === 3) {
        element = element.parentElement;
      }

      // Scroll smoothly
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Apply Highlight Class
      element.classList.add('gargaaraa-citation-highlight');

      // Remove after 3 seconds
      setTimeout(() => {
        element.classList.remove('gargaaraa-citation-highlight');
      }, 3000);
    }
  } else {
    console.log("Gargaaraa: Exact match not found for citation.");
  }
  
  // Clear selection so it doesn't look messy
  window.getSelection().removeAllRanges();
}