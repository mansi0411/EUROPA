let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCwt6NpoRvRiEP_CVyuMNJCZhdXNGxGzgc";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null 
    }
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    let RequestOption = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "contents": [
                {"parts": [{"text": user.message}, ...(user.file.data ? [{"inline_data": user.file}] : [])]
                }]
        })
    };
    
    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").trim();
        text.innerHTML = apiResponse;
    } catch(error) {
        console.log(error);
        text.innerHTML = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    } finally {
        chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"});
        user.file = {};
    }  
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function handlechatResponse(usermessage) {
    if(!usermessage.trim()) return;
    
    user.message = usermessage;
    let html = `
        <div class="chat-avatar user-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        </div>
        <div class="user-chat-area">
           ${user.message}
           ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
           <div class="message-time">${getCurrentTime()}</div>
        </div>`;
    
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox); 
    chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        let html = `
            <div class="chat-avatar ai-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </div>
            <div class="ai-chat-area"> 
                <div class="typing-indicator">
                    <span>AI is typing</span>
                    <div class="loader">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>`; 
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 800);
}

prompt.addEventListener("keydown", (e) => {
    if(e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string 
        };
        // Visual feedback for image selection
        imagebtn.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)';
        setTimeout(() => {
            imagebtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 2000);
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});

// Add some productivity shortcuts
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        prompt.focus();
    }
});