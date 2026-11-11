// server.js - Future Minds Academy Backend
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

// Serve static files from root folder (index.html is here)
app.use(express.static(__dirname));

// ====== Render से Gemini key भेजने वाला endpoint ======
// Environment variable GEMINI_API_KEY से key पढ़कर frontend को भेजता है
app.get('/api/get-key', (req, res) => {
    res.json({ key: process.env.GEMINI_API_KEY || '' });
});

// In-memory progress store (production में DB/session उपयोग करें)
let userProgress = {
    totalPoints: 0,
    completedTasks: {},
    quizScores: {},
    lastActive: new Date().toISOString()
};

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', app: 'Future Minds Academy', timestamp: new Date().toISOString() });
});

// Get progress
app.get('/api/progress', (req, res) => {
    res.json(userProgress);
});

// Save progress
app.post('/api/progress/save', (req, res) => {
    const { points, track, classNum, taskOrQuizId, type } = req.body;

    if (typeof points === 'number' && points > 0) {
        userProgress.totalPoints += points;
    }

    const key = `track_${track}_class_${classNum}_${type}_${taskOrQuizId}`;
    if (type === 'task') {
        userProgress.completedTasks[key] = new Date().toISOString();
    } else if (type === 'quiz') {
        userProgress.quizScores[key] = new Date().toISOString();
    }
    userProgress.lastActive = new Date().toISOString();

    res.json({
        success: true,
        totalPoints: userProgress.totalPoints,
        message: "✅ प्रोग्रेस सेव हो गई! / Progress saved!"
    });
});

// Reset progress (for teachers/parents)
app.post('/api/progress/reset', (req, res) => {
    userProgress = { totalPoints: 0, completedTasks: {}, quizScores: {}, lastActive: new Date().toISOString() };
    res.json({ success: true, message: "Progress reset" });
});

// SPA fallback - serve index.html from root
// ⚠️ यह हमेशा सबसे आखिरी route होना चाहिए
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Future Minds Academy running at http://localhost:${PORT}`);
});
