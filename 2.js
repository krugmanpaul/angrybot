// 요소 선택
const chatOutput = document.getElementById('chatOutput');
const textInput = document.getElementById('textInput');
const sendButton = document.getElementById('sendButton');
const voiceButton = document.getElementById('voiceButton');

// API 키 설정 (실제 배포 시에는 환경 변수나 안전한 방식으로 관리해야 합니다)
const API_KEY = 'AIzaSyAQZE27fyGAOj9hBerK5Ej-qWIZiUu2_Hk';

// 메시지 전송 이벤트 리스너
sendButton.addEventListener('click', sendMessage);
textInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// 음성 인식 설정
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'ko-KR';
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        textInput.value = transcript;
    };
    
    voiceButton.addEventListener('click', function() {
        recognition.start();
        voiceButton.textContent = '듣는 중...';
        
        recognition.onend = function() {
            voiceButton.textContent = '음성 입력';
        };
    });
} else {
    voiceButton.style.display = 'none';
}

// 메시지 전송 함수
async function sendMessage() {
    const userInput = textInput.value.trim();
    if (!userInput) return;
    
    // 사용자 메시지 표시
    displayMessage('user', userInput);
    textInput.value = '';
    
    // 로딩 표시
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai loading';
    loadingDiv.textContent = '응답 중...';
    chatOutput.appendChild(loadingDiv);
    
    try {
        // Claude API 호출 예시
        const response = await callClaudeAPI(userInput);
        
        // 로딩 제거 및 AI 응답 표시
        chatOutput.removeChild(loadingDiv);
        displayMessage('ai', response);
    } catch (error) {
        chatOutput.removeChild(loadingDiv);
        displayMessage('error', '오류가 발생했습니다: ' + error.message);
    }
}

// 메시지 표시 함수
function displayMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatOutput.appendChild(messageDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Claude API 호출 함수
async function callClaudeAPI(userInput) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            messages: [{ role: "user", content: userInput }],
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
}

// 다른 AI API를 사용하려면 아래와 같은 함수를 추가로 구현하면 됩니다

// ChatGPT API 호출 함수
async function callOpenAIAPI(userInput) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: userInput }],
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Gemini API 호출 함수
async function callGeminiAPI(userInput) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: userInput }] }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}