const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un utilisateur du serveur.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('La raison du bannissement'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // Permission requise
        .setDMPermission(false), // Désactivé en MP
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'Aucune raison fournie';
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.reply({ content: "Impossible de trouver cet utilisateur sur ce serveur.", ephemeral: true });
        }

        if (!member.bannable) {
            return interaction.reply({ content: "Je ne peux pas bannir cet utilisateur (rôle supérieur ou égal au mien).", ephemeral: true });
        }

        try {
            await member.ban({ reason: reason });
            await interaction.reply({ content: `🚫 **${targetUser.tag}** a été banni.\nRaison : ${reason}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la tentative de bannissement.', ephemeral: true });
        }
    },
};
