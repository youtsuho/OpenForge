const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // On prépare les commandes
        const commands = client.commands.map(cmd => cmd.data.toJSON());
        
        // Petit log temporaire si le chargement est long
        console.log('⏳ Chargement et enregistrement des commandes en cours...');

        try {
            // Enregistrement des commandes (API Discord)
            await client.application.commands.set(commands);
            
            // --- DÉMARRAGE DE L'INTERFACE CONSOLE ---
            
            // 1. Nettoyage de la console
            console.clear();

            // 2. Définition des couleurs ANSI
            const reset = "\x1b[0m";
            const bright = "\x1b[1m";
            const cyan = "\x1b[36m";
            const blue = "\x1b[34m";
            const green = "\x1b[32m";
            const yellow = "\x1b[33m";
            const white = "\x1b[37m";

            // 3. Bannière ASCII Art
            const asciiArt = `
${cyan}   ____                    ______                      
  / __ \\                  |  ____|                     
 | |  | |_ __   ___ _ __  | |__ ___  _ __ __ _  ___    
 | |  | | '_ \\ / _ \\ '_ \\ |  __/ _ \\| '__/ _\` |/ _ \\   
 | |__| | |_) |  __/ | | || | | (_) | | | (_| |  __/   
  \\____/| .__/ \\___|_| |_||_|  \\___/|_|  \\__, |\\___|   
        | |                               __/ |        
        |_|                              |___/         ${reset}`;

            // 4. Affichage
            console.log(asciiArt);
            console.log(`${blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
            console.log(` ${green}✅ SYSTEME OPÉRATIONNEL${reset}`);
            console.log(`${blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
            
            console.log(` ${bright}${white}🤖 Bot User    :${reset} ${yellow}${client.user.tag}${reset}`);
            console.log(` ${bright}${white}🆔 Bot ID      :${reset} ${yellow}${client.user.id}${reset}`);
            console.log(` ${bright}${white}🛡️  Serveurs    :${reset} ${yellow}${client.guilds.cache.size}${reset}`);
            console.log(` ${bright}${white}💻 Commandes   :${reset} ${yellow}${commands.length} chargées${reset}`);
            
            console.log(`${blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
            console.log(`\n${white}En attente d'interactions...${reset}\n`);

        } catch (error) {
            console.error('❌ Erreur lors de l\'enregistrement des commandes :', error);
        }
    },
};