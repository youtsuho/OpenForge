const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    execute(member) {
        // Exemple simple : log console. 
        // Pour envoyer un message, il faudrait récupérer un channel spécifique (ex: via config ou ID).
        console.log(`👋 Nouveau membre : ${member.user.tag} a rejoint ${member.guild.name}.`);
    },
};
