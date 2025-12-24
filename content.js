let gargaaraaBtn = null;

document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // 1. If no text, remove button
  if (!selectedText) {
    removeButton();
    return;
  }

  // 2. If button exists, remove it to redraw at new position
  if (gargaaraaBtn) removeButton();

  // 3. Calculate Position
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Position: Top-Right of selection
  const top = rect.top + window.scrollY - 40; 
  const left = rect.right + window.scrollX + 5;

  createButton(top, left, selectedText);
});

// Remove button if clicking elsewhere
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
  
  // Get icon from extension
  const iconUrl = chrome.runtime.getURL("icon.png");
  gargaaraaBtn.style.backgroundImage = `url(${iconUrl})`;
  gargaaraaBtn.setAttribute("title", "Ask Gargaaraa");

  // Handle Click
  gargaaraaBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    chrome.runtime.sendMessage({
      action: "open_gargaaraa_fab",
      text: text
    });
    
    removeButton();
  });

  document.body.appendChild(gargaaraaBtn);
  
  // Animation
  requestAnimationFrame(() => {
    gargaaraaBtn.classList.add("visible");
  });
}

function removeButton() {
  if (gargaaraaBtn) {
    gargaaraaBtn.remove();
    gargaaraaBtn = null;
  }
}