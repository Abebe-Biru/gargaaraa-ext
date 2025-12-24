# Gargaaraa AI Assistant 🇪🇹

**Gargaaraa** is a powerful, context-aware Chrome Extension designed to bring AI assistance to **Afaan Oromoo** and **Amharic** speakers. It integrates seamlessly into your browsing experience, allowing you to chat with web pages, documents, and selected text instantly.

![Version](https://img.shields.io/badge/version-1.4-blue) ![Manifest](https://img.shields.io/badge/manifest-V3-green) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Key Features

*   **🌍 Chat with Current Page:** Instantly summarize or ask questions about the article you are reading with a single click.
*   **🖱️ Smart Context Menu:** Highlight any text, right-click, and choose "Chat with Gargaaraa" to analyze that specific section.
*   **🚀 Floating Action Button (FAB):** Select text and a tiny Gargaaraa icon appears instantly for quick access.
*   **📄 Document Analysis:** Upload **PDF** or **TXT** files and chat with their content directly in the browser.
*   **🗣️ Native Localization:** Fully localized UI in **Afaan Oromoo** (Default) and **Amharic**.
*   **🎨 Rich Text Support:** Renders Markdown, tables, and syntax-highlighted code blocks.
*   **🌗 Theming:** Beautiful Light and Dark modes that persist across sessions.

---

## 🛠️ Installation Guide

Since this extension is currently in **Developer Mode**, follow these steps to install it:

1.  **Download the Source Code:**
    *   Clone this repository or download the ZIP file and extract it.
    *   Ensure you have the `lib/` folder containing the necessary dependencies (`pdf.js`, `notiflix.js`, etc.).

2.  **Open Chrome Extensions:**
    *   Open Google Chrome.
    *   Navigate to `chrome://extensions/` in the address bar.

3.  **Enable Developer Mode:**
    *   Toggle the **"Developer mode"** switch in the top-right corner.

4.  **Load the Extension:**
    *   Click the **"Load unpacked"** button (top-left).
    *   Select the `Gargaaraa-Extension` folder.

5.  **Pin it:**
    *   Click the 🧩 (Puzzle) icon in your Chrome toolbar and pin **Gargaaraa**.

---

## 🚀 How to Use

### 1. Initial Setup
1.  Click the extension icon to open the Side Panel.
2.  Click the **Settings (⚙️)** icon in the header.
3.  Enter your **Addis Assistant API Key**.
4.  Select your preferred language and theme.
5.  Click **Save**.

### 2. Chatting with a Web Page
1.  Navigate to any article or website.
2.  Open the Gargaaraa Side Panel.
3.  Click the **Globe Icon (🌍)** in the input bar.
4.  The extension will read the page content. Once loaded, ask questions like *"Summarize this"* or *"What is the main argument?"*.

### 3. Chatting with Selected Text
1.  Highlight any text on a webpage.
2.  **Option A:** Click the floating **Gargaaraa Icon** that appears near your cursor.
3.  **Option B:** Right-click and select **"Chat with Gargaaraa"**.
4.  The text is automatically attached as context.

### 4. Chatting with Files
1.  Click the **Paperclip (📎)** icon.
2.  Select a `.pdf` or `.txt` file from your computer.
3.  Once the chip appears (e.g., `doc.pdf`), ask questions about the document.

---

## 🔒 Privacy & Permissions

Gargaaraa is designed with privacy in mind. It runs entirely client-side and only communicates with the `api.addisassistant.com` endpoint.

*   **`activeTab` & `scripting`:** Used only when you click "Read Page" to extract text from the current tab.
*   **`sidePanel`:** To display the chat interface.
*   **`storage`:** To save your API Key and Chat History locally on your device.
*   **`contextMenus`:** To add the right-click functionality.

---

## 🤝 Contributing

Contributions are welcome! Please ensure you follow **Manifest V3** guidelines (no remote code execution).

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Powered by Addis AI**