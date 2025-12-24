// 1. Create Context Menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gargaaraa-context",
    title: "Chat with Gargaaraa",
    contexts: ["selection"]
  });
});

// 2. Handle Context Menu Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gargaaraa-context") {
    saveAndOpen(info.selectionText, tab.windowId);
  }
});

// 3. Handle Floating Button Click (Message from content.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_gargaaraa_fab") {
    saveAndOpen(request.text, sender.tab.windowId);
  }
});

// Helper: Save text and open panel
function saveAndOpen(text, windowId) {
  chrome.storage.local.set({ "pendingSelection": text }, () => {
    chrome.sidePanel.open({ windowId: windowId });
  });
}