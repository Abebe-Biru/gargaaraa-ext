// Gargaaraa Floating Action Button (FAB) Logic

let gargaaraaBtn = null;
let isButtonVisible = false;

function createButton() {
  const btn = document.createElement("div");
  btn.id = "gargaaraa-fab";
  
  // High Z-Index to stay on top
  Object.assign(btn.style, {
    position: "absolute",
    zIndex: "2147483647", 
    display: "none",
    width: "32px",
    height: "32px",
    background: "#4f46e5", // Indigo Primary
    borderRadius: "50%",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s ease, opacity 0.15s ease",
    opacity: "0",
    transform: "scale(0.8)"
  });

  // EMBEDDED SVG ICON (Guarantees visibility)
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  document.body.appendChild(btn);

  // Interaction Logic
  // Use mousedown to prevent losing text selection focus
  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selection = window.getSelection().toString().trim();
    if (selection) {
      // Animate Click
      btn.style.transform = "scale(0.9)";
      setTimeout(() => {
        chrome.runtime.sendMessage({ action: "open_side_panel", text: selection });
        hideButton();
      }, 100);
    }
  });

  return btn;
}

function showButton(x, y) {
  if (!gargaaraaBtn) gargaaraaBtn = createButton();

  // Position relative to document
  gargaaraaBtn.style.left = `${x}px`;
  gargaaraaBtn.style.top = `${y}px`;
  gargaaraaBtn.style.display = "flex";
  
  // Animation
  requestAnimationFrame(() => {
    gargaaraaBtn.style.opacity = "1";
    gargaaraaBtn.style.transform = "scale(1)";
  });
  
  isButtonVisible = true;
}

function hideButton() {
  if (gargaaraaBtn && isButtonVisible) {
    gargaaraaBtn.style.opacity = "0";
    gargaaraaBtn.style.transform = "scale(0.8)";
    setTimeout(() => {
      gargaaraaBtn.style.display = "none";
    }, 150);
    isButtonVisible = false;
  }
}

// Logic to detect selection end
document.addEventListener("mouseup", (e) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate absolute position (Scroll + Rect)
      // Position button slightly above and to the right of the selection end
      const x = window.scrollX + rect.right - 10;
      const y = window.scrollY + rect.top - 40; 

      // Boundary check (don't go off top of screen)
      const safeY = y < 0 ? window.scrollY + rect.bottom + 10 : y;

      showButton(x, safeY);
    } else {
      hideButton();
    }
  }, 10); // Small delay to ensure selection is finalized
});

// Hide on document scroll to prevent floating weirdness
document.addEventListener("scroll", () => {
  if (isButtonVisible) hideButton();
}, { passive: true });