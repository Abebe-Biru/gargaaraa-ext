// 1. Create the Context Menu on Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "gargaaraa-context",
    title: "Chat with Gargaaraa",
    contexts: ["selection"]
  });
});

// 2. Handle the Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gargaaraa-context") {
    // Save the selected text to storage
    chrome.storage.local.set({ "pendingSelection": info.selectionText }, () => {
      // Open the side panel
      chrome.sidePanel.open({ windowId: tab.windowId });
    });
  }
});