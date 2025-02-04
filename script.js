// عناصر DOM
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const youtubeFrame = document.getElementById('youtubeFrame');
const closeYoutubeButton = document.getElementById('closeYoutubeButton');
const startCallButton = document.getElementById('startCallButton');
const stopCallButton = document.getElementById('stopCallButton');
const toggleVideoButton = document.getElementById('toggleVideoButton');
const toggleAudioButton = document.getElementById('toggleAudioButton');
const shareYoutubeButton = document.getElementById('shareYoutubeButton');
const sendFileButton = document.getElementById('sendFileButton');
const sendStickerButton = document.getElementById('sendStickerButton');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const fileInput = document.getElementById('fileInput');
const stickerModal = document.getElementById('stickerModal');
const closeModal = document.querySelector('.close');
const stickerContainer = document.querySelector('.sticker-container');

// WebRTC
let localStream;
let remoteStream;
let peerConnection;
let isVideoOn = true;
let isAudioOn = true;

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // STUN server
    ]
};

// بدء المكالمة
startCallButton.addEventListener('click', async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // إنشاء اتصال WebRTC
        peerConnection = new RTCPeerConnection(servers);

        // إضافة تيار الفيديو المحلي إلى الاتصال
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // استقبال الفيديو من الطرف الآخر
        peerConnection.ontrack = event => {
            remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
        };

        startCallButton.disabled = true;
        stopCallButton.disabled = false;
        console.log("تم بدء المكالمة");
    } catch (error) {
        console.error("خطأ في بدء المكالمة:", error);
    }
});

// إنهاء المكالمة
stopCallButton.addEventListener('click', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    startCallButton.disabled = false;
    stopCallButton.disabled = true;
    console.log("تم إنهاء المكالمة");
});

// تبديل الفيديو
toggleVideoButton.addEventListener('click', () => {
    if (localStream) {
        isVideoOn = !isVideoOn;
        localStream.getVideoTracks()[0].enabled = isVideoOn;
        toggleVideoButton.textContent = isVideoOn ? "🎥" : "📷";
    }
});

// تبديل الصوت
toggleAudioButton.addEventListener('click', () => {
    if (localStream) {
        isAudioOn = !isAudioOn;
        localStream.getAudioTracks()[0].enabled = isAudioOn;
        toggleAudioButton.textContent = isAudioOn ? "🎤" : "🔇";
    }
});

// مشاركة رابط يوتيوب
shareYoutubeButton.addEventListener('click', () => {
    const youtubeLink = prompt("الرجاء إدخال رابط يوتيوب:");
    if (youtubeLink) {
        const videoId = youtubeLink.split('v=')[1] || youtubeLink.split('youtu.be/')[1];
        const startTime = youtubeLink.includes('?t=') ? youtubeLink.split('?t=')[1] : 0;
        const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${startTime}`;

        youtubeFrame.src = embedUrl;
        youtubeFrame.style.display = 'block';
        closeYoutubeButton.style.display = 'block';
        appendMessage(`تم مشاركة رابط يوتيوب: ${youtubeLink}`);
    }
});

// إغلاق فيديو اليوتيوب
closeYoutubeButton.addEventListener('click', () => {
    youtubeFrame.style.display = 'none';
    closeYoutubeButton.style.display = 'none';
});

// إرسال ملف
sendFileButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        appendMessage(`تم إرسال ملف: ${file.name}`);
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(file);
        downloadLink.download = file.name;
        downloadLink.textContent = `تحميل ${file.name}`;
        messagesDiv.appendChild(downloadLink);
    }
});

// إرسال ملصق
sendStickerButton.addEventListener('click', () => {
    stickerModal.style.display = 'block';
});

// اختيار ملصق
stickerContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('sticker')) {
        const sticker = e.target.getAttribute('data-sticker');
        appendMessage(`تم إرسال ملصق: ${sticker}`);
        stickerModal.style.display = 'none';
    }
});

// إغلاق نافذة الملصقات
closeModal.addEventListener('click', () => {
    stickerModal.style.display = 'none';
});

// إرسال رسالة
sendMessageButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
        appendMessage(`أنت: ${message}`);
        messageInput.value = '';
    }
});

// عرض الرسائل
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}