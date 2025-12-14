const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

// Vérification du token
if (!process.env.DISCORD_TOKEN) {
    console.error("ERREUR: Le token Discord est manquant dans le fichier .env");
    process.exit(1);
}

// Initialisation du client avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// --- Chargement des commandes ---
const foldersPath = path.join(__dirname, 'commands');
// Vérifie si le dossier commands existe
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
                    // Vérifie que la commande a les propriétés requises 'data' et 'execute'
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        console.log(`[COMMANDE] Chargée : ${command.data.name}`);
                    } else {
                        console.log(`[AVERTISSEMENT] La commande à ${filePath} manque "data" ou "execute".`);
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
                    console.log(`[EVENT] Chargé : ${event.name}`);
                } catch (error) {
                    console.error(`[ERREUR] Impossible de charger l'événement ${file}:`, error);
                }
            }
        }
    }
}

// Connexion au bot
client.login(process.env.DISCORD_TOKEN);
