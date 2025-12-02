const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { Op } = require("sequelize");
const { Message, Utilisateur } = require("./models");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
}));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// ========== AUTHENTICATION MIDDLEWARE ==========

// Check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, error: "Non authentifié" });
    }
    next();
};

// ========== AUTH ROUTES ==========

// Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, error: "Email et mot de passe requis" });
        }

        // Find user by email (you might want to add password verification)
        const user = await Utilisateur.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.json({ success: false, error: "Utilisateur non trouvé" });
        }

        // TODO: Add proper password verification here
        // For now, we'll just check if the user exists
        // You should use bcrypt to compare hashed passwords

        // Set session
        req.session.userId = user.id;
        req.session.user = {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email
        };

        res.json({ 
            success: true, 
            message: "Connexion réussie",
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Logout
app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Erreur lors de la déconnexion" });
        }
        res.json({ success: true, message: "Déconnexion réussie" });
    });
});

// Get current user
app.get("/api/me", requireAuth, (req, res) => {
    res.json({ success: true, user: req.session.user });
});

// ========== MESSAGE ROUTES (PROTECTED) ==========

// Get inbox messages
app.get("/api/inbox", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const messages = await Message.findAll({
            where: { id_destinataire: userId },
            include: [{ 
                model: Utilisateur, 
                as: "expediteur",
                attributes: ['id', 'nom', 'prenom']
            }],
            order: [["id", "DESC"]]
        });

        const formattedMessages = messages.map(m => ({
            id: m.id,
            content: m.contenu,
            sender: m.expediteur ? `${m.expediteur.prenom} ${m.expediteur.nom}` : 'Unknown',
            date: m.date
        }));

        res.json({ success: true, messages: formattedMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Get sent messages
app.get("/api/sent", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const messages = await Message.findAll({
            where: { id_expediteur: userId },
            include: [{ 
                model: Utilisateur, 
                as: "destinataire",
                attributes: ['id', 'nom', 'prenom']
            }],
            order: [["id", "DESC"]]
        });

        const formattedMessages = messages.map(m => ({
            id: m.id,
            content: m.contenu,
            recipient: m.destinataire ? `${m.destinataire.prenom} ${m.destinataire.nom}` : 'Unknown',
            date: m.date
        }));

        res.json({ success: true, messages: formattedMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Send message
app.post("/api/send", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { recipient, content } = req.body;

        if (!recipient || !content) {
            return res.json({ success: false, error: "Tous les champs sont requis" });
        }

        const parts = recipient.split(" ");
        if (parts.length < 2) {
            return res.json({ success: false, error: "Format: Nom Prénom" });
        }

        const [nom, prenom] = parts;
        const destUser = await Utilisateur.findOne({
            where: { nom: { [Op.like]: nom }, prenom: { [Op.like]: prenom } }
        });
        
        if (!destUser) {
            return res.json({ success: false, error: "Destinataire introuvable" });
        }

        await Message.create({
            id_expediteur: userId,
            id_destinataire: destUser.id,
            contenu: content,
            date: new Date()
        });

        res.json({ success: true, message: "Message envoyé!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Get users for autocomplete
app.get("/api/users", requireAuth, async (req, res) => {
    try {
        const users = await Utilisateur.findAll({
            attributes: ['id', 'nom', 'prenom', 'email'],
            order: [['nom', 'ASC']]
        });

        const formattedUsers = users.map(u => ({
            id: u.id,
            fullName: `${u.prenom} ${u.nom}`,
            email: u.email
        }));

        res.json({ success: true, users: formattedUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Get unread count
app.get("/api/unread-count", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const count = await Message.count({
            where: { 
                id_destinataire: userId,
                lu: false 
            }
        });

        res.json({ success: true, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Get conversation between two users
app.get("/api/chat/:otherUserId", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const otherUserId = req.params.otherUserId;
        
        const user = await Utilisateur.findByPk(userId);
        const otherUser = await Utilisateur.findByPk(otherUserId);
        
        if (!user || !otherUser) {
            return res.status(404).json({ success: false, error: "Utilisateur introuvable" });
        }

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { id_expediteur: userId, id_destinataire: otherUserId },
                    { id_expediteur: otherUserId, id_destinataire: userId }
                ]
            },
            include: [{ 
                model: Utilisateur, 
                as: "expediteur",
                attributes: ['id', 'nom', 'prenom']
            }],
            order: [["date", "ASC"]]
        });

        const formattedMessages = messages.map(m => ({
            id: m.id,
            content: m.contenu,
            senderId: m.id_expediteur,
            senderName: m.expediteur ? `${m.expediteur.prenom} ${m.expediteur.nom}` : 'Unknown',
            date: m.date,
            isOwn: m.id_expediteur == userId
        }));

        res.json({ 
            success: true, 
            user: {
                id: user.id,
                name: `${user.prenom} ${user.nom}`
            },
            otherUser: {
                id: otherUser.id,
                name: `${otherUser.prenom} ${otherUser.nom}`
            },
            messages: formattedMessages 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Send message in conversation
app.post("/api/chat/:otherUserId", requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const otherUserId = req.params.otherUserId;
        const { content } = req.body;

        if (!content) {
            return res.json({ success: false, error: "Merci de saisir un message !" });
        }

        // Vérifier que les utilisateurs existent
        const sender = await Utilisateur.findByPk(userId);
        const recipient = await Utilisateur.findByPk(otherUserId);
        if (!sender || !recipient) {
            return res.json({ success: false, error: "Utilisateur introuvable !" });
        }

        // Créer le message
        await Message.create({
            id_expediteur: userId,
            id_destinataire: otherUserId,
            contenu: content,
            date: new Date()
        });

        res.json({ success: true, message: "Message envoyé!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// Simple HTML route for testing
app.get("/", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Messagerie API</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 4px solid #007cba; }
                </style>
            </head>
            <body>
                <h1>Messagerie API Server</h1>
                <p>Server is running successfully!</p>
                <p>Available endpoints:</p>
                <div class="endpoint"><strong>POST</strong> /api/login</div>
                <div class="endpoint"><strong>POST</strong> /api/logout</div>
                <div class="endpoint"><strong>GET</strong> /api/me</div>
                <div class="endpoint"><strong>GET</strong> /api/inbox</div>
                <div class="endpoint"><strong>GET</strong> /api/sent</div>
                <div class="endpoint"><strong>POST</strong> /api/send</div>
                <div class="endpoint"><strong>GET</strong> /api/users</div>
                <div class="endpoint"><strong>GET</strong> /api/unread-count</div>
                <div class="endpoint"><strong>GET</strong> /api/chat/:otherUserId</div>
                <div class="endpoint"><strong>POST</strong> /api/chat/:otherUserId</div>
                <p>Test the API: <a href="/api/test" target="_blank">/api/test</a></p>
            </body>
        </html>
    `);
});

// Start server
app.listen(3000, () => {
    console.log("Serveur messagerie API : http://localhost:3010");
    console.log("Main page: http://localhost:3010/");
});