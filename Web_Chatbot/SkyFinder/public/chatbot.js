const scenarios = {
    "greeting": {
        "keywords": ["chào", "hi", "hello", "chào bạn", "xin chào", "welcome"],
        "responses": ["Xin chào! Tôi có thể giúp gì cho bạn?", "Chào bạn! Có gì tôi có thể giúp?"]
    },
    "default": {
        "responses": ["Tôi chưa nghe rõ, bạn có thể nói lại không?", "Tôi chưa hiểu ý của bạn."]
    }
};

function getResponse(userMessage) {
    for (let scenario in scenarios) {
        if (scenarios[scenario].keywords && scenarios[scenario].keywords.some(keyword => userMessage.includes(keyword))) {
            let possibleResponses = scenarios[scenario].responses;
            return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
        }
    }
    let defaultResponses = scenarios["default"].responses;
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function sendMessage() {
    const userInput = document.getElementById('userInput').value.toLowerCase().trim();
    if (!userInput) return;

    const messages = document.getElementById('messages');

    // Display user's message
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user');

    const userAvatar = document.createElement('img');
    userAvatar.src = 'iconbot.png'; 
    userAvatar.classList.add('avatar');

    const userMessageContent = document.createElement('div');
    userMessageContent.textContent = userInput;
    userMessageContent.classList.add('message-content');

    userMessage.appendChild(userMessageContent);
    userMessage.appendChild(userAvatar);
    messages.appendChild(userMessage);

    // Get and display bot's response
    const botResponse = getResponse(userInput);
    const botMessage = document.createElement('div');
    botMessage.classList.add('message', 'bot');

    const botAvatar = document.createElement('img');
    botAvatar.src = 'iconbot.png'; 
    botAvatar.classList.add('avatar');

    const botMessageContent = document.createElement('div');
    botMessageContent.textContent = botResponse;
    botMessageContent.classList.add('message-content');

    botMessage.appendChild(botAvatar);
    botMessage.appendChild(botMessageContent);
    messages.appendChild(botMessage);

    // Scroll to the bottom
    messages.scrollTop = messages.scrollHeight;

    // Clear the input
    document.getElementById('userInput').value = '';
}

// Toggle chatbot visibility
const chatbotIcon = document.getElementById('chatbot-icon');
const chatbot = document.getElementById('chatbot');

chatbotIcon.addEventListener('click', () => {
    if (chatbot.style.display === 'none' || chatbot.style.display === '') {
        chatbot.style.display = 'flex';
        chatbotIcon.style.animation = 'none';
    } else {
        chatbot.style.display = 'none';
        chatbotIcon.style.animation = 'bell-shake 0.5s infinite';
    }
});

// Send message on Enter key press
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
