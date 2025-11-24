const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const { Op } = require("sequelize");
const { Message, Utilisateur } = require("./models");

const app = express();



const path = require('path');



// Configuration de Handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// ... le reste de votre code


// ----- Handlebars avec helper -----
app.engine("hbs", engine({ extname: "hbs", helpers: {
    eq: (a, b) => a == b
}}));
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));

// ----- Inbox -----
app.get("/inbox/:id", async (req, res) => {
    const userId = req.params.id;
    const user = await Utilisateur.findByPk(userId);
    const messages = await Message.findAll({
        where: { id_destinataire: userId },
        include: [{ model: Utilisateur, as: "expediteur" }],
        order: [["id", "DESC"]]
    });

    res.render("inbox", { 
        userId,
        user: user.toJSON(),       // ← envoyer nom + prenom
        messages: messages.map(m => m.toJSON())
    });
});

// ----- Messages envoyés -----
app.get("/sent/:id", async (req, res) => {
    const userId = req.params.id;
    const user = await Utilisateur.findByPk(userId);
    const messages = await Message.findAll({
        where: { id_expediteur: userId },
        include: [{ model: Utilisateur, as: "destinataire" }],
        order: [["id", "DESC"]]
    });

    res.render("sent", { 
        userId,
        user: user.toJSON(),       // ← envoyer nom + prenom
        messages: messages.map(m => m.toJSON()) });
});

// ----- Page d'envoi par nom complet -----
app.get("/send/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await Utilisateur.findByPk(userId);

        res.render("send", { 
            userId: userId,
            user: user ? user.toJSON() : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur serveur");
    }
});


// ----- Envoi d'un message -----
app.post("/send/:id", async (req, res) => {
    const userId = req.params.id;
    const dest_fullname = req.body.dest_nom?.trim();
    const contenu = req.body.contenu?.trim();

    if (!dest_fullname) return res.send("Merci de saisir le nom complet !");
    if (!contenu) return res.send("Merci de saisir un message !");

    // Séparer nom et prénom
    const parts = dest_fullname.split(" ");
    if (parts.length < 2) return res.send("Merci de saisir nom et prénom séparés par un espace !");

    const [nom, prenom] = parts;

    // Chercher l'utilisateur
    const destUser = await Utilisateur.findOne({
        where: {
            nom: { [Op.like]: nom },
            prenom: { [Op.like]: prenom }
        }
    });
    if (!destUser) return res.send("Destinataire introuvable !");

    // Créer le message
    await Message.create({
        id_expediteur: userId,
        id_destinataire: destUser.id,
        contenu,
        date: new Date()
    });

    // Rediriger vers la conversation
    res.redirect(`/chat/${userId}/${destUser.id}`);
});

// ----- Page conversation style chat -----
app.get("/chat/:userId/:otherUserId", async (req, res) => {
    const { userId, otherUserId } = req.params;
    
    const user = await Utilisateur.findByPk(userId);
    const otherUser = await Utilisateur.findByPk(otherUserId);
    if (!user || !otherUser) return res.send("Utilisateur introuvable !");

    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { id_expediteur: userId, id_destinataire: otherUserId },
                { id_expediteur: otherUserId, id_destinataire: userId }
            ]
        },
        include: [{ model: Utilisateur, as: "expediteur" }],
        order: [["date", "ASC"]]
    });

    res.render("chat", { userId,user: user.toJSON(), otherUser: otherUser.toJSON(), messages: messages.map(m => m.toJSON()) });
});

// ----- Envoi depuis conversation -----
app.post("/chat/:userId/:otherUserId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const otherUserId = parseInt(req.params.otherUserId);
    const contenu = req.body.contenu?.trim();

    if (!contenu) return res.send("Merci de saisir un message !");

    // Vérifier que les utilisateurs existent
    const sender = await Utilisateur.findByPk(userId);
    const recipient = await Utilisateur.findByPk(otherUserId);
    if (!sender || !recipient) return res.send("Utilisateur introuvable !");

    // Créer le message
    await Message.create({
        id_expediteur: userId,
        id_destinataire: otherUserId,
        contenu,
        date: new Date()
    });

    // Redirection vers la conversation
    res.redirect(`/chat/${userId}/${otherUserId}`);
});



// ----- Start -----
app.listen(3000, () => console.log("Serveur messagerie : http://localhost:3000"));
