
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { initDatabase } = require('./db');
require('dotenv').config();

// Vérification du token
if (!process.env.DISCORD_TOKEN) {
    console.error("ERREUR: Le token Discord est manquant dans le fichier .env");
    process.exit(1);
}

// Initialisation du client avec les intents en valeur numérique (53608447)
const client = new Client({
    intents: 53608447,
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// Initialisation de la DB
initDatabase();

// Collection pour stocker les commandes
client.commands = new Collection();

// --- Chargement des commandes ---
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        if (fs.statSync(commandsPath).isDirectory()) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                try {
                    const command = require(filePath);
                    if ('data' in command && 'execute' in command) {
                        // On attache la catégorie (nom du dossier) à la commande
                        command.category = folder;
                        client.commands.set(command.data.name, command);
                    }
                } catch (error) {
                    console.error(`[ERREUR] Impossible de charger la commande ${file}:`, error);
                }
            }
        }
    }
}

// --- Chargement des événements ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFolders = fs.readdirSync(eventsPath);

    for (const folder of eventFolders) {
        const folderPath = path.join(eventsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const filePath = path.join(folderPath, file);
                try {
                    const event = require(filePath);
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args));
                    }
                } catch (error) {
                    console.error(`[ERREUR] Impossible de charger l'événement ${file}:`, error);
                }
            }
        }
    }
}

// Connexion au bot
client.login(process.env.DISCORD_TOKEN);
