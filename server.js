require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const ejs = require('ejs');

const app = express();

// DATABASE CONNECTION (MongoDB Atlas Cloud Vault - Enforces production string override fallback structures)
const cloudMongoURI = process.env.MONGO_URI && !process.env.MONGO_URI.includes('127.0.0.1') 
    ? process.env.MONGO_URI 
    : 'mongodb+srv://rohan9922758495_db_user:0PfjjeLkaNU0EKwm@rohan000.ea5li24.mongodb.net/aureum?retryWrites=true&w=majority&appName=Rohan000';

mongoose.connect(cloudMongoURI, {
    serverSelectionTimeoutMS: 5000 
})
.then(() => console.log('🛡️ Private secure ledger (MongoDB Cloud Atlas) operational.'))
.catch(err => {
    console.error('❌ MONGODB CLOUD CONNECTION PIPELINE ERROR:', err.message);
});

// Database Schemas
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    tier: { type: String, default: 'Sovereign Tier' },
    avatarLetter: { type: String, default: 'G' },
    vaultCapacity: { type: Number, default: 1245100 },
    liquidityDeployed: { type: Number, default: 482830 },
    activePortfolios: { type: Number, default: 8 },
    budgets: [
        { name: String, amount: Number, spent: Number, icon: String, percent: Number }
    ],
    expenses: [
        { name: String, amount: Number, date: String, budgetName: String } 
    ]
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Middleware Config Matrix
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets out of path mapping variables
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Enforce proxy evaluations for secure edge verification tracking layers
app.set('trust proxy', 1);
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'aureum_secure_vault_key'],
    maxAge: 24 * 60 * 60 * 1000, 
    secure: true,
    sameSite: 'none'
}));

// MAP EJS TO RENDER VIEW MATRIX TEMPLATES
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname)); 

// Authentication Route Guard
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/auth.html');
    }
};

/* ================= SYSTEM OPERATIONAL ROUTES ================= */

app.get('/dashboard', requireAuth, (req, res) => res.redirect('/dashboard.html'));

// Renders dashboard template layers with database object payloads
app.get('/dashboard.html', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/auth.html');
        res.render('dashboard.html', { user });
    } catch (err) {
        console.error("Dashboard render failed:", err);
        res.redirect('/auth.html');
    }
});

app.get('/budget', requireAuth, (req, res) => res.redirect('/budget.html'));

app.get('/budget.html', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/auth.html');
        res.render('budget.html', { user });
    } catch (err) {
        console.error("Budget view render failed:", err);
        res.redirect('/dashboard.html');
    }
});

app.get('/expense', requireAuth, (req, res) => res.redirect('/expense.html'));

app.get('/expense.html', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/auth.html');
        res.render('expense.html', { user }); 
    } catch (err) {
        console.error("Expense ledger rendering fault:", err);
        res.redirect('/dashboard.html');
    }
});

app.get('/profile', requireAuth, (req, res) => res.redirect('/profile.html'));

app.get('/profile.html', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/auth.html');
        res.render('profile.html', { user }); 
    } catch (err) {
        console.error("Profile view rendering fault:", err);
        res.redirect('/dashboard.html');
    }
});

/* ================= DYNAMIC AUTH API PIPELINES ================= */

// Handle Sign Up
app.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are mandatory.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'This email is already registered.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 12);

        const newUser = new User({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            avatarLetter: name.trim().charAt(0).toUpperCase(),
            budgets: [],
            expenses: []
        });

        await newUser.save();
        req.session.userId = newUser._id.toString();
        return res.json({ success: true, redirectUrl: '/dashboard.html' });
        
    } catch (error) {
        console.error("SIGNUP PIPELINE FAULT:", error);
        res.status(500).json({ success: false, message: 'Registration internal systems failure.' });
    }
});

// Handle Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Both fields are required.' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Identity unmatched.' });
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        req.session.userId = user._id.toString();
        return res.json({ success: true, redirectUrl: '/dashboard.html' });
        
    } catch (error) {
        console.error("LOGIN PIPELINE CRITICAL ERROR:", error);
        res.status(500).json({ success: false, message: 'Authentication engine error.' });
    }
});

// Handle Logout
app.get('/auth/logout', (req, res) => {
    req.session = null; 
    res.redirect('/auth.html');
});

/* ================= OPERATIONAL PORTFOLIO API CORE ================= */

app.get('/api/budgets', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access." });
        }
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, budgets: user.budgets || [] });
    } catch (error) {
        console.error("Fetch budgets system failure:", error);
        res.status(500).json({ success: false, message: "Internal server data retrieval failure." });
    }
});

app.post('/api/budgets/edit', requireAuth, async (req, res) => {
    try {
        const { oldName, newName, newAmount } = req.body;
        if (!oldName || !newName || !newAmount || isNaN(newAmount) || Number(newAmount) <= 0) {
            return res.status(400).json({ success: false, message: "Valid inputs required." });
        }

        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ success: false, message: "Identity node not found." });

        const targetBudget = user.budgets.find(b => b.name.toLowerCase() === oldName.trim().toLowerCase());
        if (!targetBudget) return res.status(404).json({ success: false, message: "Target budget category not found." });

        targetBudget.name = newName.trim();
        targetBudget.amount = Number(newAmount);
        targetBudget.percent = Math.min(Math.round((targetBudget.spent / targetBudget.amount) * 100), 100);

        user.expenses.forEach(exp => {
            if (exp.budgetName && exp.budgetName.toLowerCase() === oldName.trim().toLowerCase()) {
                exp.budgetName = newName.trim();
            }
        });

        await user.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Budget update error:", err);
        res.status(500).json({ success: false, message: "Server database update failure." });
    }
});

app.post('/api/budgets/delete', requireAuth, async (req, res) => {
    try {
        const { budgetName } = req.body;
        if (!budgetName) return res.status(400).json({ success: false, message: "Target required." });

        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ success: false, message: "Identity node not found." });

        user.budgets = user.budgets.filter(b => b.name.toLowerCase() !== budgetName.trim().toLowerCase());
        user.expenses = user.expenses.filter(exp => !exp.budgetName || exp.budgetName.toLowerCase() !== budgetName.trim().toLowerCase());

        await user.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Budget removal error:", err);
        res.status(500).json({ success: false, message: "Server document structural deletion failure." });
    }
});

app.post('/api/budgets/create', requireAuth, async (req, res) => {
    try {
        const { name, amount, icon } = req.body;
        if (!name || !amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Valid inputs required." });
        }

        const newBudgetCard = {
            name: name.trim(),
            amount: Number(amount),
            spent: 0,
            icon: icon && icon.trim() !== "" ? icon.trim() : "💼",
            percent: 0
        };

        await User.findByIdAndUpdate(req.session.userId, {
            $push: { budgets: newBudgetCard }
        });
        res.json({ success: true });
    } catch (err) {
        console.error("Budget creation failure:", err);
        res.status(500).json({ success: false, message: "Internal server parameter fault." });
    }
});

app.post('/api/expenses/create', requireAuth, async (req, res) => {
    try {
        const { name, amount, budgetName } = req.body;
        if (!name || !amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Valid variables required." });
        }

        const numericAmount = Number(amount);
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ success: false, message: "Identity node not found." });

        const newExpense = {
            name: name.trim(),
            amount: numericAmount,
            date: formattedDate,
            budgetName: budgetName ? budgetName.trim() : "Shopping" 
        };

        if (budgetName) {
            const targetBudget = user.budgets.find(b => b.name.toLowerCase() === budgetName.trim().toLowerCase());
            if (targetBudget) {
                targetBudget.spent = (targetBudget.spent || 0) + numericAmount;
                targetBudget.percent = Math.min(Math.round((targetBudget.spent / targetBudget.amount) * 100), 100);
            }
        }

        user.expenses.unshift(newExpense);
        await user.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Expense deployment error:", err);
        res.status(500).json({ success: false, message: "Internal server registry allocation failure." });
    }
});

app.post('/api/expenses/delete/:id', requireAuth, async (req, res) => {
    try {
        const expenseId = req.params.id;
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ success: false, message: "Identity node not found." });

        const targetExpense = user.expenses.id(expenseId);
        if (targetExpense && targetExpense.budgetName) {
            const targetBudget = user.budgets.find(b => b.name.toLowerCase() === targetExpense.budgetName.toLowerCase());
            if (targetBudget) {
                targetBudget.spent = Math.max(0, (targetBudget.spent || 0) - targetExpense.amount);
                targetBudget.percent = targetBudget.amount > 0 ? Math.min(Math.round((targetBudget.spent / targetBudget.amount) * 100), 100) : 0;
            }
        }

        user.expenses.pull({ _id: expenseId });
        await user.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Expense ledger deletion error:", err);
        res.status(500).json({ success: false, message: "Server sub-document array mutation failure." });
    }
});
/* ================= FALLBACK ENGINE ROUTING ================= */

// Base entry root path serves index.html natively out of the bundled task workspace
app.get('/', (req, res) => {
    const indexPath = path.resolve(__dirname, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            // Fallback automatically to auth gateway if index isn't found
            const authPath = path.resolve(__dirname, 'auth.html');
            res.sendFile(authPath, (err2) => {
                if (err2) res.status(404).send("Ledger entry portal file missing from system build.");
            });
        }
    });
});

// Whitelisted page routing matrix using stable absolute path serving
app.get('/:page', async (req, res, next) => {
    const filename = req.params.page;
    
    try {
        // 1. Guard-protected dashboard pages that REQUIRE an active session & DB lookup
        if (filename === 'dashboard.html' || filename === 'budget.html' || filename === 'profile.html' || filename === 'expense.html') {
            if (!req.session || !req.session.userId) {
                return res.redirect('/auth.html');
            }

            const user = await User.findById(req.session.userId);
            if (!user) return res.redirect('/auth.html');
            
            // Render user profile variables using EJS dynamically
            return res.render(filename, { user }); 
        }
        
        // 2. Public static views (like auth.html) served safely without path errors
        if (filename.endsWith('.html')) {
            return res.sendFile(path.resolve(__dirname, filename), (err) => {
                if (err) next();
            });
        }
        
        next();
    } catch (err) {
        console.error("Fallback path resolution error:", err);
        res.status(404).send("Requested asset view node not found.");
    }
});

// Static middleware layer to serve companion assets natively
app.use(express.static(path.resolve(__dirname)));

// Catch-all route for unhandled requests redirects straight to login page
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'auth.html'), (err) => {
        if (err) res.status(404).send("Requested endpoint template context not found.");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Telemetry pipeline open at port ${PORT}`));

module.exports = app;