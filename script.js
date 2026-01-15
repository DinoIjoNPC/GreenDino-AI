// API Configuration
let API_KEY = "sk-3206ed4039424e71bf9f41325161fcd1";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtnMini = document.getElementById('send-btn-mini');
const sendBtnMain = document.getElementById('send-btn-main');
const clearBtn = document.getElementById('clear-btn');
const voiceBtn = document.getElementById('voice-btn');
const helpBtn = document.getElementById('help-btn');
const historyBtn = document.getElementById('history-btn');
const apiBtn = document.getElementById('api-btn');
const menuBtn = document.getElementById('menu-btn');
const historyPanel = document.getElementById('history-panel');
const apiPanel = document.getElementById('api-panel');
const menuPanel = document.getElementById('menu-panel');
const closeHistoryPanel = document.getElementById('close-history-panel');
const closeApiPanel = document.getElementById('close-api-panel');
const closeMenuPanel = document.getElementById('close-menu-panel');
const historyList = document.getElementById('history-list');
const copyScriptBtn = document.getElementById('copy-script-btn');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiBtn = document.getElementById('save-api-btn');
const changeThemeBtn = document.getElementById('change-theme-btn');
const exportChatBtn = document.getElementById('export-chat-btn');
const settingsBtn = document.getElementById('settings-btn');

// Chat state
let chatHistory = [];
let currentChatId = generateChatId();
let isProcessing = false;

// Initialize chat history from localStorage
function initChatHistory() {
    const savedHistory = localStorage.getItem('greenDinoChatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        updateHistoryList();
    } else {
        const welcomeChat = {
            id: currentChatId,
            title: "Percakapan Awal",
            messages: [{
                role: "assistant",
                content: "🦕 Halo! Saya GreenDino AI Assistant!\n\nSaya siap membantu Anda dengan berbagai pertanyaan dan tugas.\n\n🔑 API Key sudah aktif dan siap digunakan.",
                timestamp: new Date().toISOString()
            }],
            timestamp: new Date().toISOString()
        };
        chatHistory.push(welcomeChat);
        saveChatHistory();
        updateHistoryList();
    }
    
    const savedApiKey = localStorage.getItem('greenDinoApiKey');
    if (savedApiKey) {
        API_KEY = savedApiKey;
        apiKeyInput.value = savedApiKey;
    }
}

// Generate unique chat ID
function generateChatId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Save chat history to localStorage
function saveChatHistory() {
    localStorage.setItem('greenDinoChatHistory', JSON.stringify(chatHistory));
}

// Update history list UI
function updateHistoryList() {
    historyList.innerHTML = '';
    
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    if (currentChat) {
        const currentItem = createHistoryItem(currentChat, true);
        historyList.appendChild(currentItem);
    }
    
    chatHistory
        .filter(chat => chat.id !== currentChatId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach(chat => {
            const item = createHistoryItem(chat, false);
            historyList.appendChild(item);
        });
}

// Create history item element
function createHistoryItem(chat, isActive) {
    const item = document.createElement('div');
    item.className = `history-item ${isActive ? 'active' : ''}`;
    item.dataset.chatId = chat.id;
    
    let preview = "Percakapan kosong";
    if (chat.messages && chat.messages.length > 0) {
        const firstMessage = chat.messages[0];
        preview = firstMessage.content.substring(0, 60);
        if (firstMessage.content.length > 60) preview += "...";
    }
    
    const date = new Date(chat.timestamp);
    const dateStr = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    item.innerHTML = `
        <div class="history-title">${chat.title || "Percakapan Tanpa Judul"}</div>
        <div class="history-preview">${preview}</div>
        <div class="history-date"><i class="far fa-clock"></i> ${dateStr}</div>
    `;
    
    item.addEventListener('click', () => {
        if (chat.id !== currentChatId) {
            loadChat(chat.id);
            closePanel(historyPanel);
        }
    });
    
    return item;
}

// Load chat by ID
function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    renderChatMessages(chat.messages);
    updateHistoryList();
}

// Render chat messages to UI
function renderChatMessages(messages) {
    chatContainer.innerHTML = '';
    
    messages.forEach(msg => {
        addMessageToUI(msg.content, msg.role === 'user' ? 'user' : 'ai', msg.timestamp);
    });
    
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// Add message to UI
function addMessageToUI(content, sender, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-dragon';
    const time = timestamp ? new Date(timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    }) : new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <p>${formatMessage(content)}</p>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// Format message with line breaks
function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
}

// Show loading animation
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.id = 'loading-message';
    
    loadingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-dragon"></i>
        </div>
        <div class="message-content">
            <div class="loading">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Hide loading animation
function hideLoading() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

// Send message to AI
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isProcessing) return;
    
    addMessageToUI(message, 'user');
    messageInput.value = '';
    adjustTextareaHeight();
    
    showLoading();
    isProcessing = true;
    sendBtnMini.disabled = true;
    sendBtnMain.disabled = true;
    
    try {
        let currentChat = chatHistory.find(chat => chat.id === currentChatId);
        if (!currentChat) {
            currentChat = {
                id: currentChatId,
                title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
                messages: [],
                timestamp: new Date().toISOString()
            };
            chatHistory.push(currentChat);
        }
        
        currentChat.messages.push({
            role: "user",
            content: message,
            timestamp: new Date().toISOString()
        });
        
        if (currentChat.messages.length === 1) {
            currentChat.title = message.substring(0, 30) + (message.length > 30 ? "..." : "");
        }
        
        const apiMessages = currentChat.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: apiMessages,
                max_tokens: 2000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        hideLoading();
        addMessageToUI(aiResponse, 'ai');
        
        currentChat.messages.push({
            role: "assistant",
            content: aiResponse,
            timestamp: new Date().toISOString()
        });
        
        currentChat.timestamp = new Date().toISOString();
        saveChatHistory();
        updateHistoryList();
        
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        
        addMessageToUI(
            `❌ <strong>Maaf, terjadi kesalahan!</strong><br><br>
            <em>Detail: ${error.message}</em><br><br>
            Silakan periksa API Key Anda.`,
            'ai'
        );
        
        let currentChat = chatHistory.find(chat => chat.id === currentChatId);
        if (currentChat) {
            currentChat.timestamp = new Date().toISOString();
            saveChatHistory();
            updateHistoryList();
        }
    } finally {
        isProcessing = false;
        sendBtnMini.disabled = false;
        sendBtnMain.disabled = false;
        messageInput.focus();
    }
}

// Adjust textarea height
function adjustTextareaHeight() {
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, 120);
    messageInput.style.height = newHeight + 'px';
}

// Clear chat
function clearChat() {
    if (chatContainer.children.length <= 1) return;
    
    if (confirm("Apakah Anda yakin ingin menghapus percakapan saat ini?")) {
        currentChatId = generateChatId();
        chatContainer.innerHTML = '';
        
        addMessageToUI(
            "🦕 <strong>Halo! GreenDino di sini!</strong><br><br>Percakapan baru telah dimulai.",
            'ai'
        );
        
        const newChat = {
            id: currentChatId,
            title: "Percakapan Baru",
            messages: [{
                role: "assistant",
                content: "🦕 Halo! GreenDino di sini! Percakapan baru telah dimulai.",
                timestamp: new Date().toISOString()
            }],
            timestamp: new Date().toISOString()
        };
        
        chatHistory.push(newChat);
        saveChatHistory();
        updateHistoryList();
    }
}

// Voice input
function voiceInput() {
    addMessageToUI("🎤 Fitur suara akan segera hadir! Silakan ketik pesan Anda.", 'ai');
}

// Show help
function showHelp() {
    const helpText = `
        <strong>🦕 Panduan GreenDino</strong><br><br>
        
        <strong>Cara Menggunakan:</strong><br>
        • Ketik pesan dan klik tombol kirim<br>
        • Tekan Enter untuk mengirim<br>
        • Ganti API Key di panel pengaturan<br>
        • Akses riwayat percakapan<br><br>
        
        <strong>Tombol:</strong><br>
        • <i class="fas fa-broom"></i> Bersihkan: Mulai percakapan baru<br>
        • <i class="fas fa-microphone"></i> Suara: Input suara<br>
        • <i class="fas fa-question-circle"></i> Bantuan: Panduan ini
    `;
    
    addMessageToUI(helpText, 'ai');
}

// Open panel
function openPanel(panel) {
    panel.classList.add('active');
}

// Close panel
function closePanel(panel) {
    panel.classList.remove('active');
}

// Save API key
function saveApiKey() {
    const newApiKey = apiKeyInput.value.trim();
    if (!newApiKey) {
        alert("API Key tidak boleh kosong!");
        return;
    }
    
    API_KEY = newApiKey;
    localStorage.setItem('greenDinoApiKey', newApiKey);
    
    addMessageToUI("✅ API Key berhasil diperbarui!", 'ai');
    closePanel(apiPanel);
}

// Change theme
function changeTheme() {
    const themes = [
        { name: "Hijau Dinosaurus", primary: "#2e7d32" },
        { name: "Biru Laut", primary: "#1565c0" },
        { name: "Ungu Ajaib", primary: "#6a1b9a" },
        { name: "Oranye Cerah", primary: "#ef6c00" }
    ];
    
    let currentThemeIndex = 0;
    const root = document.documentElement;
    
    const currentColor = getComputedStyle(root).getPropertyValue('--primary-green').trim();
    themes.forEach((theme, index) => {
        if (theme.primary === currentColor) {
            currentThemeIndex = index;
        }
    });
    
    const nextThemeIndex = (currentThemeIndex + 1) % themes.length;
    const nextTheme = themes[nextThemeIndex];
    
    root.style.setProperty('--primary-green', nextTheme.primary);
    root.style.setProperty('--light-green', lightenColor(nextTheme.primary, 20));
    root.style.setProperty('--dark-green', darkenColor(nextTheme.primary, 15));
    root.style.setProperty('--dino-green', nextTheme.primary);
    root.style.setProperty('--accent-green', lightenColor(nextTheme.primary, 30));
    
    addMessageToUI(`🎨 Tema diubah ke: ${nextTheme.name}`, 'ai');
    closePanel(menuPanel);
}

// Lighten color
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return "#" + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// Darken color
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return "#" + (
        0x1000000 +
        (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
        (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
        (B > 0 ? (B < 255 ? B : 255) : 0)
    ).toString(16).slice(1);
}

// Export chat
function exportChat() {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    if (!currentChat || currentChat.messages.length === 0) {
        addMessageToUI("Tidak ada percakapan untuk diekspor.", 'ai');
        return;
    }
    
    let exportText = `GreenDino Chat Export\n`;
    exportText += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`;
    exportText += `====================\n\n`;
    
    currentChat.messages.forEach(msg => {
        const sender = msg.role === 'user' ? 'Anda' : 'GreenDino';
        const time = new Date(msg.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        exportText += `[${time}] ${sender}:\n`;
        exportText += `${msg.content}\n\n`;
    });
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greendino-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addMessageToUI("📄 Percakapan telah diekspor!", 'ai');
    closePanel(menuPanel);
}

// Show settings
function showSettings() {
    const settingsText = `
        <strong>⚙️ Pengaturan GreenDino</strong><br><br>
        
        <strong>Pengaturan AI:</strong><br>
        • Model: DeepSeek Chat<br>
        • Suhu: 0.7<br>
        • Token Maks: 2000<br><br>
        
        <strong>Fitur:</strong><br>
        • Riwayat Chat<br>
        • Ekspor Chat<br>
        • Ganti Tema<br>
        • Kelola API Key
    `;
    
    addMessageToUI(settingsText, 'ai');
    closePanel(menuPanel);
}

// Copy script
function copyScript() {
    const scriptToCopy = `<!-- GreenDino AI Chat Assistant -->\n<!-- Dibuat oleh DinoIjoNPC -->\n<!-- API Key: ${API_KEY.substring(0, 10)}... -->`;
    
    navigator.clipboard.writeText(scriptToCopy)
        .then(() => {
            const originalText = copyScriptBtn.innerHTML;
            copyScriptBtn.innerHTML = '<i class="fas fa-check"></i> Script Disalin!';
            copyScriptBtn.style.background = 'linear-gradient(to right, #4caf50, #66bb6a)';
            
            setTimeout(() => {
                copyScriptBtn.innerHTML = originalText;
                copyScriptBtn.style.background = 'linear-gradient(to right, var(--primary-green), var(--dino-green))';
            }, 2000);
            
            addMessageToUI("📋 Script telah disalin!", 'ai');
        })
        .catch(err => {
            console.error('Gagal:', err);
            addMessageToUI("❌ Gagal menyalin script.", 'ai');
        });
}

// Event Listeners
sendBtnMini.addEventListener('click', sendMessage);
sendBtnMain.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

messageInput.addEventListener('input', adjustTextareaHeight);

clearBtn.addEventListener('click', clearChat);
voiceBtn.addEventListener('click', voiceInput);
helpBtn.addEventListener('click', showHelp);

historyBtn.addEventListener('click', () => openPanel(historyPanel));
apiBtn.addEventListener('click', () => openPanel(apiPanel));
menuBtn.addEventListener('click', () => openPanel(menuPanel));

closeHistoryPanel.addEventListener('click', () => closePanel(historyPanel));
closeApiPanel.addEventListener('click', () => closePanel(apiPanel));
closeMenuPanel.addEventListener('click', () => closePanel(menuPanel));

saveApiBtn.addEventListener('click', saveApiKey);
changeThemeBtn.addEventListener('click', changeTheme);
exportChatBtn.addEventListener('click', exportChat);
settingsBtn.addEventListener('click', showSettings);
copyScriptBtn.addEventListener('click', copyScript);

// Close panels when clicking outside
document.addEventListener('click', (e) => {
    if (!historyPanel.contains(e.target) && !historyBtn.contains(e.target)) {
        closePanel(historyPanel);
    }
    if (!apiPanel.contains(e.target) && !apiBtn.contains(e.target)) {
        closePanel(apiPanel);
    }
    if (!menuPanel.contains(e.target) && !menuBtn.contains(e.target)) {
        closePanel(menuPanel);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initChatHistory();
    adjustTextareaHeight();
    messageInput.focus();
    messageInput.style.height = '60px';
});
