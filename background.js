chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gargaaraa-context",
    title: "Chat with Gargaaraa",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gargaaraa-context") {
    saveAndOpen(info.selectionText, tab.windowId);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_gargaaraa_fab") {
    saveAndOpen(request.text, sender.tab.windowId);
  }
});

function saveAndOpen(text, windowId) {
  chrome.storage.local.set({ "pendingSelection": text }, () => {
    chrome.sidePanel.open({ windowId: windowId });
  });
}