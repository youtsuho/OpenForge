const { SlashCommandBuilder, EmbedBuilder, ChannelType, time } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription(' ℹ️  Affiche diverses informations.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot')
                .setDescription(' 🤖  Affiche des informations sur le bot.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('salon')
                .setDescription(' 📁  Affiche des informations sur un salon.')
                .addChannelOption(option => option.setName('target').setDescription('Le salon à inspecter')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('serveur')
                .setDescription(' 🏰  Affiche des informations sur le serveur actuel.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription(' 👤  Affiche des informations sur un utilisateur.')
                .addUserOption(option => option.setName('target').setDescription('L\'utilisateur à inspecter'))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const embed = new EmbedBuilder().setColor(0xFF5733).setTimestamp();

        if (subcommand === 'bot') {
            const uptime = Math.floor(process.uptime());
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);

            embed.setTitle('🤖 Informations sur le Bot')
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .addFields(
                    { name: 'Nom', value: `${interaction.client.user.tag}`, inline: true },
                    { name: 'Latence API', value: `\`${interaction.client.ws.ping}ms\``, inline: true },
                    { name: 'Uptime', value: `${hours}h ${minutes}m`, inline: true },
                    { name: 'Serveurs', value: `${interaction.client.guilds.cache.size}`, inline: true },
                    { name: 'Utilisateurs', value: `${interaction.client.users.cache.size}`, inline: true },
                    { name: 'Version Node', value: `\`${process.version}\``, inline: true }
                );
        }

        else if (subcommand === 'salon') {
            const channel = interaction.options.getChannel('target') || interaction.channel;
            
            embed.setTitle(`📁 Informations sur le salon : ${channel.name}`)
                .addFields(
                    { name: 'ID', value: `\`${channel.id}\``, inline: true },
                    { name: 'Type', value: `${ChannelType[channel.type]}`, inline: true },
                    { name: 'Création', value: `${time(channel.createdAt, 'D')}`, inline: true },
                    { name: 'Position', value: `${channel.rawPosition + 1}`, inline: true }
                );
            
            if (channel.parent) embed.addFields({ name: 'Catégorie', value: channel.parent.name, inline: true });
        }

        else if (subcommand === 'serveur') {
            const { guild } = interaction;
            const owner = await guild.fetchOwner();

            embed.setTitle(`🏰 Informations sur ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Propriétaire', value: `${owner.user.tag}`, inline: true },
                    { name: 'ID', value: `\`${guild.id}\``, inline: true },
                    { name: 'Créé le', value: `${time(guild.createdAt, 'D')}`, inline: true },
                    { name: 'Membres', value: `${guild.memberCount}`, inline: true },
                    { name: 'Rôles', value: `${guild.roles.cache.size}`, inline: true },
                    { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0} (Niv. ${guild.premiumTier})`, inline: true }
                );
        }

        else if (subcommand === 'user') {
            const user = interaction.options.getUser('target') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id);

            embed.setTitle(`👤 Informations sur ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Pseudo', value: user.tag, inline: true },
                    { name: 'ID', value: `\`${user.id}\``, inline: true },
                    { name: 'Robot ?', value: user.bot ? 'Oui' : 'Non', inline: true },
                    { name: 'Compte créé le', value: `${time(user.createdAt, 'f')}`, inline: false },
                    { name: 'Rejoint le', value: `${time(member.joinedAt, 'f')}`, inline: false },
                    { name: 'Plus haut rôle', value: `${member.roles.highest}`, inline: true }
                );
        }

        await interaction.reply({ embeds: [embed] });
    },
};