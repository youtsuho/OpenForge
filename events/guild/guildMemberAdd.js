const { Events, EmbedBuilder } = require('discord.js');
const { pool } = require('../../db');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        console.log(`👋 Nouveau membre : ${member.user.tag} a rejoint ${member.guild.name}.`);

        try {
            // Récupérer la config du serveur
            const [rows] = await pool.execute('SELECT * FROM welcome_settings WHERE guild_id = ? AND enabled = 1', [member.guild.id]);
            
            if (rows.length === 0) return;
            const config = rows[0];

            // --- PARTIE 1 : Attribution du Rôle ---
            if (config.role_id) {
                try {
                    const role = member.guild.roles.cache.get(config.role_id);
                    if (role) {
                        // On vérifie si le bot peut gérer ce rôle (si son rôle est plus haut que celui qu'il veut donner)
                        if (member.guild.members.me.roles.highest.position > role.position) {
                            await member.roles.add(role);
                            console.log(`🛡️ Rôle auto-attribué à ${member.user.tag} : ${role.name}`);
                        } else {
                            console.warn(`⚠️ Impossible d'attribuer le rôle ${role.name} : position supérieure à celle du bot.`);
                        }
                    }
                } catch (roleError) {
                    console.error(`❌ Erreur lors de l'attribution du rôle auto :`, roleError);
                }
            }

            // --- PARTIE 2 : Message de Bienvenue ---
            if (!config.channel_id) return;

            const channel = member.guild.channels.cache.get(config.channel_id);
            if (!channel) return;

            const replacePlaceholders = (text) => {
                if (!text) return "";
                return text
                    .replace(/{user}/g, `<@${member.user.id}>`)
                    .replace(/{username}/g, member.user.username)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount.toString());
            };

            const embed = new EmbedBuilder()
                .setTitle(replacePlaceholders(config.title))
                .setDescription(replacePlaceholders(config.description))
                .setColor(config.color)
                .setFooter({ text: replacePlaceholders(config.footer) })
                .setTimestamp();

            if (config.thumbnail) embed.setThumbnail(config.thumbnail);
            if (config.image) embed.setImage(config.image);

            await channel.send({ content: `Bienvenue ${member} !`, embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors du traitement du message de bienvenue (SQL) :', error);
        }
    },
};