// FAQ Database (Predefined Hotel Answers)
const hotelFAQs = {
    "Hello": "How can I help you today?",
    "What time is check-in?": "Check-in time is from 2:00 PM onwards.",
    "What time is check-out?": "Check-out time is at 12:00 PM.",
    "Do you have free Wi-Fi?": "Yes, we provide free high-speed Wi-Fi in all rooms and public areas.",
    "Is breakfast included?": "Yes, complimentary breakfast is included with all bookings.",
    "Can I cancel my booking?": "Cancellation policies vary depending on your booking type. Please check your confirmation email.",
    "Do you have a swimming pool?": "Yes, our hotel has an outdoor swimming pool available for all guests.",
    "How do I modify my reservation?": "You can modify your reservation by contacting our front desk or using the booking portal."
};

// Chatbox Elements
const chatbox = document.getElementById("chatbox");
const openChatButton = document.getElementById("open-chat");
const closeChatButton = document.getElementById("close-chat");
const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");

// Open Chatbox
openChatButton.addEventListener("click", () => {
    chatbox.style.display = "flex";
    openChatButton.style.display = "none";
});

// Close Chatbox
closeChatButton.addEventListener("click", () => {
    chatbox.style.display = "none";
    openChatButton.style.display = "block";
});

// Handle Chat Submission
chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get User Message
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Display User Message
    displayUserMessage(userMessage);

    // Clear Input
    chatInput.value = "";

    // Scroll to Latest Message
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Check FAQ Database First
    const response = getFAQResponse(userMessage);
    if (response) {
        displayBotResponse(response);
    } else {
        const aiReply = await getBotResponse(userMessage);
        displayBotResponse(aiReply);
    }
});

// Function to Check FAQs Before Calling Gemini API
function getFAQResponse(message) {
    const userMessage = message.toLowerCase();
    for (let question in hotelFAQs) {
        if (userMessage.includes(question.toLowerCase())) {
            return hotelFAQs[question]; // Return predefined response
        }
    }
    return null; // If no match, return null
}
// Function to Display User Message
function displayUserMessage(message) {
    const userDiv = document.createElement("div");
    userDiv.textContent = `You: ${message}`;
    userDiv.style.textAlign = "right";
    userDiv.style.background = "#007bff";
    userDiv.style.color = "white";
    userDiv.style.padding = "8px";
    userDiv.style.borderRadius = "10px";
    userDiv.style.margin = "5px";
    userDiv.style.maxWidth = "75%";
    userDiv.style.alignSelf = "flex-end";
    chatMessages.appendChild(userDiv);
}
// Function to Display AI Response
function displayBotResponse(response) {
    const botDiv = document.createElement("div");
    botDiv.textContent = `Gemini AI: ${response}`;
    botDiv.style.textAlign = "left";
    chatMessages.appendChild(botDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to Get Bot Response from Google Gemini API
async function getBotResponse(message) {
    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        return data.reply;

    } catch (error) {
        console.error("Error:", error);
        return "Error connecting to server 😭";
    }
}
