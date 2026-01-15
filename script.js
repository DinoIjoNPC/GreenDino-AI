// ==================== KONFIGURASI API ====================
const DEFAULT_API_KEY = "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";
let API_KEY = DEFAULT_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

// ==================== DOM ELEMENTS ====================
// Main elements
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Header buttons
const historyBtn = document.getElementById('history-btn');
const apiBtn = document.getElementById('api-btn');
const menuBtn = document.getElementById('menu-btn');

// Feature buttons
const clearBtn = document.getElementById('clear-btn');
const voiceBtn = document.getElementById('voice-btn');
const helpBtn = document.getElementById('help-btn');
const exampleBtn = document.getElementById('example-btn');
const copyScriptBtn = document.getElementById('copy-script-btn');

// API panel elements
const apiPanel = document.getElementById('api-panel');
const closeApiBtn = document.getElementById('close-api');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiBtn = document.getElementById('save-api-btn');
const testApiBtn = document.getElementById('test-api-btn');
const showKeyBtn = document.getElementById('show-key-btn');
const resetKeyBtn = document.getElementById('reset-key-btn');
const apiStatus = document.getElementById('api-status');

// History panel elements
const historyPanel = document.getElementById('history-panel');
const closeHistoryBtn = document.getElementById('close-history');
const historyList = document.getElementById('history-list');

// Menu panel elements
const menuPanel = document.getElementById('menu-panel');
const closeMenuBtn = document.getElementById('close-menu');
const themeBtn = document.getElementById('theme-btn');
const exportBtn = document.getElementById('export-btn');
const settingsBtn = document.getElementById('settings-btn');
const aboutBtn = document.getElementById('about-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const refreshBtn = document.getElementById('refresh-btn');

// ==================== STATE VARIABLES ====================
let isProcessing = false;
let chatHistory = [];
let currentChatId = null;
let isKeyVisible = false;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('GreenDino initializing...');
    
    // Initialize chat
    initChat();
    
    // Initialize API key
    initApiKey();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Focus on input
    setTimeout(() => {
        messageInput.focus();
        console.log('GreenDino ready! All buttons should work.');
    }, 500);
});

// ==================== CHAT FUNCTIONS ====================
function initChat() {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('greenDinoChatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
    }
    
    // Create new chat if no history exists
    if (chatHistory.length === 0) {
        currentChatId = generateId();
        const welcomeChat = {
            id: currentChatId,
            title: "Chat Baru",
            messages: [{
                role: "assistant",
                content: "🦕 <strong>Halo! Saya GreenDino AI Assistant!</strong>\n\nSaya menggunakan OpenAI API (ChatGPT) untuk membantu Anda.\n\n🔑 API Key sudah aktif dan siap digunakan.\nKirim pesan untuk memulai percakapan!",
                timestamp: new Date().toISOString()
            }],
            timestamp: new Date().toISOString()
        };
        chatHistory.push(welcomeChat);
        saveChatHistory();
    } else {
        currentChatId = chatHistory[chatHistory.length - 1].id;
    }
    
    // Display current chat
    displayCurrentChat();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveChatHistory() {
    localStorage.setItem('greenDinoChatHistory', JSON.stringify(chatHistory));
}

function displayCurrentChat() {
    chatContainer.innerHTML = '';
    
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    if (currentChat && currentChat.messages) {
        currentChat.messages.forEach(msg => {
            addMessageToUI(msg.content, msg.role);
        });
    }
}

function addMessageToUI(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    
    const time = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${formatMessage(content)}</p>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.id = 'loading-message';
    
    loadingDiv.innerHTML = `
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

function hideLoading() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) loadingMsg.remove();
}

// ==================== SEND MESSAGE FUNCTION ====================
async function sendMessage() {
    console.log('Send button clicked!');
    
    const message = messageInput.value.trim();
    if (!message || isProcessing) {
        console.log('Cannot send: empty message or processing');
        return;
    }
    
    console.log('Sending message:', message.substring(0, 50) + '...');
    
    // Add user message to UI
    addMessageToUI(message, 'user');
    
    // Clear input
    messageInput.value = '';
    adjustTextareaHeight();
    
    // Show loading
    showLoading();
    isProcessing = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        // Get or create current chat
        let currentChat = chatHistory.find(chat => chat.id === currentChatId);
        if (!currentChat) {
            currentChatId = generateId();
            currentChat = {
                id: currentChatId,
                title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
                messages: [],
                timestamp: new Date().toISOString()
            };
            chatHistory.push(currentChat);
        }
        
        // Add user message to chat
        currentChat.messages.push({
            role: "user",
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Prepare API messages
        const apiMessages = [
            {
                role: "system",
                content: "Anda adalah GreenDino, asisten AI dengan tema dinosaurus hijau yang lucu, ramah, dan pintar. Gunakan emoji dinosaurus 🦕 sesekali. Sapa dengan ramah dan bantu dengan baik."
            }
        ];
        
        // Add conversation history (last 10 messages)
        const recentMessages = currentChat.messages.slice(-10);
        recentMessages.forEach(msg => {
            apiMessages.push({
                role: msg.role,
                content: msg.content
            });
        });
        
        console.log('Calling OpenAI API...');
        
        // Call OpenAI API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: apiMessages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
                }
            } catch (e) {
                // If response is not JSON
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        console.log('Got AI response:', aiResponse.substring(0, 50) + '...');
        
        // Hide loading
        hideLoading();
        
        // Add AI response to UI
        addMessageToUI(aiResponse, 'assistant');
        
        // Add AI response to chat
        currentChat.messages.push({
            role: "assistant",
            content: aiResponse,
            timestamp: new Date().toISOString()
        });
        
        // Update chat timestamp
        currentChat.timestamp = new Date().toISOString();
        
        // Save to localStorage
        saveChatHistory();
        
        // Update API status
        apiStatus.textContent = "Aktif ✓";
        apiStatus.className = "status-success";
        
        showNotification("Pesan terkirim!", "success");
        
    } catch (error) {
        console.error('Error sending message:', error);
        hideLoading();
        
        // Show error message
        addMessageToUI(
            `❌ <strong>Maaf, terjadi kesalahan!</strong><br><br>` +
            `<em>Detail: ${error.message}</em><br><br>` +
            `Silakan periksa API Key Anda atau coba lagi nanti.`,
            'assistant'
        );
        
        // Update API status
        apiStatus.textContent = "Error";
        apiStatus.className = "status-error";
        
        showNotification(`Error: ${error.message}`, "error");
        
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        messageInput.focus();
    }
}

// ==================== API FUNCTIONS ====================
function initApiKey() {
    const savedApiKey = localStorage.getItem('greenDinoApiKey');
    if (savedApiKey) {
        API_KEY = savedApiKey;
        apiKeyInput.value = savedApiKey;
    } else {
        API_KEY = DEFAULT_API_KEY;
        apiKeyInput.value = DEFAULT_API_KEY;
        localStorage.setItem('greenDinoApiKey', DEFAULT_API_KEY);
    }
}

async function testApiKey() {
    const keyToTest = apiKeyInput.value.trim() || API_KEY;
    if (!keyToTest) {
        showNotification("API Key tidak boleh kosong", "error");
        return;
    }
    
    testApiBtn.disabled = true;
    testApiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    apiStatus.textContent = "Testing...";
    apiStatus.className = "status-pending";
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keyToTest}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 5
            })
        });
        
        if (response.ok) {
            apiStatus.textContent = "Aktif ✓";
            apiStatus.className = "status-success";
            showNotification("✅ API Key valid!", "success");
        } else {
            apiStatus.textContent = "Tidak valid";
            apiStatus.className = "status-error";
            showNotification("❌ API Key tidak valid", "error");
        }
    } catch (error) {
        apiStatus.textContent = "Gagal";
        apiStatus.className = "status-error";
        showNotification(`❌ Gagal menghubungi API: ${error.message}`, "error");
    } finally {
        testApiBtn.disabled = false;
        testApiBtn.innerHTML = '<i class="fas fa-vial"></i> Test API Key';
    }
}

function saveApiKey() {
    const newKey = apiKeyInput.value.trim();
    if (!newKey) {
        showNotification("API Key tidak boleh kosong", "error");
        return;
    }
    
    API_KEY = newKey;
    localStorage.setItem('greenDinoApiKey', newKey);
    
    showNotification("✅ API Key berhasil disimpan", "success");
    
    // Test the new key
    setTimeout(() => {
        testApiKey();
    }, 1000);
}

function toggleKeyVisibility() {
    isKeyVisible = !isKeyVisible;
    apiKeyInput.type = isKeyVisible ? 'text' : 'password';
    showKeyBtn.innerHTML = isKeyVisible ? 
        '<i class="fas fa-eye-slash"></i> Sembunyikan Key' : 
        '<i class="fas fa-eye"></i> Tampilkan Key';
}

function resetApiKey() {
    if (confirm("Reset API Key ke default?")) {
        API_KEY = DEFAULT_API_KEY;
        apiKeyInput.value = DEFAULT_API_KEY;
        localStorage.setItem('greenDinoApiKey', DEFAULT_API_KEY);
        
        showNotification("✅ API Key direset ke default", "success");
        
        // Test the default key
        setTimeout(() => {
            testApiKey();
        }, 1000);
    }
}

// ==================== PANEL FUNCTIONS ====================
function openPanel(panel) {
    panel.classList.add('active');
}

function closePanel(panel) {
    panel.classList.remove('active');
}

function showNotification(message, type = "info") {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

function adjustTextareaHeight() {
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, 120);
    messageInput.style.height = newHeight + 'px';
}

// ==================== FEATURE FUNCTIONS ====================
function clearChat() {
    if (chatContainer.children.length === 0) return;
    
    if (confirm("Bersihkan percakapan ini?")) {
        const currentChat = chatHistory.find(chat => chat.id === currentChatId);
        if (currentChat) {
            currentChat.messages = [];
            currentChat.messages.push({
                role: "assistant",
                content: "🦕 Percakapan telah dibersihkan. Ada yang bisa saya bantu?",
                timestamp: new Date().toISOString()
            });
            saveChatHistory();
            displayCurrentChat();
            showNotification("Percakapan dibersihkan", "success");
        }
    }
}

function clearAllChats() {
    if (chatHistory.length === 0) return;
    
    if (confirm("Hapus SEMUA percakapan?")) {
        chatHistory = [];
        currentChatId = generateId();
        const welcomeChat = {
            id: currentChatId,
            title: "Chat Baru",
            messages: [{
                role: "assistant",
                content: "🦕 <strong>Semua percakapan telah dihapus!</strong>\n\nMulai percakapan baru!",
                timestamp: new Date().toISOString()
            }],
            timestamp: new Date().toISOString()
        };
        chatHistory.push(welcomeChat);
        saveChatHistory();
        displayCurrentChat();
        showNotification("Semua percakapan dihapus", "success");
    }
}

function showHelp() {
    addMessageToUI(
        "🦕 <strong>Panduan GreenDino</strong><br><br>" +
        "• <strong>Ketik pesan</strong> dan klik tombol kirim<br>" +
        "• <strong>Tekan Enter</strong> untuk mengirim pesan<br>" +
        "• <strong>Tombol Bersihkan</strong>: Bersihkan chat ini<br>" +
        "• <strong>Tombol Suara</strong>: Coming soon!<br>" +
        "• <strong>Tombol Bantuan</strong>: Tampilkan panduan ini<br>" +
        "• <strong>Tombol Contoh</strong>: Lihat contoh pertanyaan<br>" +
        "• <strong>Tombol History</strong>: Lihat riwayat chat<br>" +
        "• <strong>Tombol API Key</strong>: Kelola API Key<br>" +
        "• <strong>Tombol Menu</strong>: Fitur tambahan<br><br>" +
        "🔧 <em>Semua tombol sudah aktif dan berfungsi!</em>",
        'assistant'
    );
}

function showExamples() {
    addMessageToUI(
        "💡 <strong>Contoh Pertanyaan:</strong><br><br>" +
        "1. 'Ceritakan kisah tentang dinosaurus hijau!'<br>" +
        "2. 'Bantu saya membuat rencana belajar coding'<br>" +
        "3. 'Apa saja fakta menarik tentang AI?'<br>" +
        "4. 'Buat puisi tentang alam dan teknologi'<br>" +
        "5. 'Jelaskan cara kerja neural network'<br>" +
        "6. 'Berikan contoh kode HTML sederhana'<br>" +
        "7. 'Bagaimana cara mengurangi jejak karbon?'<br>" +
        "8. 'Tulis dialog lucu antara dua dinosaurus'<br><br>" +
        "Coba salin salah satu atau buat pertanyaan Anda sendiri!",
        'assistant'
    );
}

function voiceInput() {
    showNotification("Fitur suara akan segera hadir! 🎤", "info");
}

function changeTheme() {
    const themes = [
        { name: "Hijau Dinosaurus", color: "#2e7d32" },
        { name: "Biru Laut", color: "#1565c0" },
        { name: "Ungu Magis", color: "#6a1b9a" },
        { name: "Oranye Cerah", color: "#ef6c00" }
    ];
    
    const root = document.documentElement;
    const currentColor = getComputedStyle(root).getPropertyValue('--primary-green').trim();
    
    let currentIndex = 0;
    themes.forEach((theme, index) => {
        if (theme.color === currentColor) {
            currentIndex = index;
        }
    });
    
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    root.style.setProperty('--primary-green', nextTheme.color);
    
    addMessageToUI(`🎨 Tema diubah ke: ${nextTheme.name}`, 'assistant');
    closePanel(menuPanel);
}

function exportChat() {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    if (!currentChat || currentChat.messages.length === 0) {
        showNotification("Tidak ada chat untuk diekspor", "error");
        return;
    }
    
    let exportText = "=== GreenDino Chat Export ===\n";
    exportText += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    
    currentChat.messages.forEach(msg => {
        const sender = msg.role === 'user' ? 'Anda' : 'GreenDino';
        const time = new Date(msg.timestamp).toLocaleTimeString('id-ID');
        exportText += `[${time}] ${sender}:\n${msg.content}\n\n`;
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
    
    showNotification("Chat berhasil diekspor!", "success");
}

function showAbout() {
    addMessageToUI(
        "🦕 <strong>Tentang GreenDino</strong><br><br>" +
        "Versi: 4.0 (Semua Tombol Work!)<br>" +
        "Dibuat oleh: DinoIjoNPC<br>" +
        "Tema: Hijau Dinosaurus<br>" +
        "AI Provider: OpenAI (ChatGPT)<br>" +
        "Model: gpt-3.5-turbo<br><br>" +
        "Fitur:<br>" +
        "✅ Chat dengan AI<br>" +
        "✅ Kelola API Key<br>" +
        "✅ Riwayat Percakapan<br>" +
        "✅ Ganti Tema<br>" +
        "✅ Ekspor Chat<br>" +
        "✅ Semua tombol WORK!<br><br>" +
        "❤️ Terima kasih telah menggunakan GreenDino!",
        'assistant'
    );
}

function copyScript() {
    const scriptText = `<!-- GreenDino AI Assistant - Dibuat oleh DinoIjoNPC -->
<!-- Semua tombol WORK! API Key: ${API_KEY.substring(0, 10)}... -->
<!-- https://github.com/yourusername/greendino -->`;
    
    navigator.clipboard.writeText(scriptText).then(() => {
        showNotification("Script berhasil disalin!", "success");
    }).catch(err => {
        showNotification("Gagal menyalin script", "error");
    });
}

function refreshApp() {
    if (confirm("Refresh aplikasi?")) {
        location.reload();
    }
}

// ==================== EVENT LISTENERS SETUP ====================
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Send message events
    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', adjustTextareaHeight);
    
    // Feature buttons
    clearBtn.addEventListener('click', clearChat);
    voiceBtn.addEventListener('click', voiceInput);
    helpBtn.addEventListener('click', showHelp);
    exampleBtn.addEventListener('click', showExamples);
    copyScriptBtn.addEventListener('click', copyScript);
    
    // Header buttons
    historyBtn.addEventListener('click', () => openPanel(historyPanel));
    apiBtn.addEventListener('click', () => openPanel(apiPanel));
    menuBtn.addEventListener('click', () => openPanel(menuPanel));
    
    // Close panel buttons
    closeHistoryBtn.addEventListener('click', () => closePanel(historyPanel));
    closeApiBtn.addEventListener('click', () => closePanel(apiPanel));
    closeMenuBtn.addEventListener('click', () => closePanel(menuPanel));
    
    // API panel buttons
    saveApiBtn.addEventListener('click', saveApiKey);
    testApiBtn.addEventListener('click', testApiKey);
    showKeyBtn.addEventListener('click', toggleKeyVisibility);
    resetKeyBtn.addEventListener('click', resetApiKey);
    
    // Menu panel buttons
    themeBtn.addEventListener('click', changeTheme);
    exportBtn.addEventListener('click', exportChat);
    settingsBtn.addEventListener('click', () => {
        addMessageToUI("⚙️ <strong>Pengaturan GreenDino</strong><br><br>• AI Model: gpt-3.5-turbo<br>• Max Tokens: 1000<br>• Temperature: 0.7<br>• API Status: Aktif", 'assistant');
        closePanel(menuPanel);
    });
    aboutBtn.addEventListener('click', showAbout);
    clearAllBtn.addEventListener('click', clearAllChats);
    refreshBtn.addEventListener('click', refreshApp);
    
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
    
    console.log('All event listeners set up!');
}
