const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('normalize')
        .setDescription(' ✨  Normalise le pseudo d\'un utilisateur en retirant les caractères spéciaux.')
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à normaliser')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
        .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) return interaction.reply({ content: "Utilisateur non trouvé.", ephemeral: true });
        if (!member.manageable) return interaction.reply({ content: "Je ne peux pas modifier le pseudo de cet utilisateur.", ephemeral: true });

        // Normalisation : On garde l'Alphanumérique et les espaces basiques
        const oldNickname = member.displayName;
        let newNickname = oldNickname
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
            .replace(/[^a-zA-Z0-9 ]/g, "") // Enlever tout ce qui n'est pas Alphanumérique ou espace
            .trim();

        if (!newNickname || newNickname.length < 2) {
            newNickname = `Normalized-${user.discriminator !== '0' ? user.discriminator : user.id.slice(-4)}`;
        }

        try {
            await member.setNickname(newNickname);
            
            const embed = new EmbedBuilder()
                .setTitle('✨ Pseudo Normalisé')
                .setDescription(`Le pseudo de **${user.tag}** a été nettoyé.`)
                .addFields(
                    { name: 'Ancien', value: `\`${oldNickname}\``, inline: true },
                    { name: 'Nouveau', value: `\`${newNickname}\``, inline: true }
                )
                .setColor(0x3498db)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur est survenue lors de la modification du pseudo.", ephemeral: true });
        }
    },
};