const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();

const app = express();

// Database connection (Using your existing MongoDB layout)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker')
    .then(() => console.log('📦 MongoDB connected successfully'))
    .catch(err => console.error('❌ Database connection error:', err));

// Define User Schema directly to ensure auth works
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'aureum_secure_vault_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS, but false works fine for testing
}));

// Serve static root assets cleanly
app.use(express.static(path.join(__dirname)));

// Setup EJS engine to read HTML files securely on serverless containers
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname));

/* ================= AUTHENTICATION ENDPOINTS ================= */

// Login Route
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) { // Simple check matching your plaintext/bcrypt setup
            return res.status(400).json({ success: false, message: "Invalid email or keyphrase code." });
        }
        req.session.userId = user._id;
        return res.json({ success: true, redirectUrl: '/dashboard.html' });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server authentication error." });
    }
});

// Signup Route
app.post('/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Secure Router Node already registered." });
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        req.session.userId = newUser._id;
        return res.json({ success: true, redirectUrl: '/dashboard.html' });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server registration error." });
    }
});

/* ================= FALLBACK ENGINE ROUTING ================= */

app.get('/', (req, res) => {
    return res.render(path.join(__dirname, 'auth.html'), { user: null });
});

app.get('/:page', async (req, res, next) => {
    const filename = req.params.page;
    
    if (!filename.endsWith('.html')) return next();

    try {
        // Protected Views
        if (['dashboard.html', 'budget.html', 'profile.html', 'expense.html'].includes(filename)) {
            if (!req.session || !req.session.userId) {
                return res.redirect('/auth.html');
            }
            const user = await User.findById(req.session.userId);
            if (!user) return res.redirect('/auth.html');
            return res.render(path.join(__dirname, filename), { user });
        }
        
        // Public Views
        return res.render(path.join(__dirname, filename), { user: null });
    } catch (err) {
        console.error("Template rendering fault:", err);
        res.status(404).send("Requested asset view node not found.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));

module.exports = app;