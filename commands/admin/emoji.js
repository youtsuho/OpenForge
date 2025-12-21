const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription(' ✨  Système de gestion des emojis.')
        .addSubcommand(subcommand =>
            subcommand.setName('voir').setDescription(' 🔎  Afficher un emoji personnalisé en grand.').addStringOption(option => option.setName('emoji').setDescription('L\'emoji à agrandir').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('add').setDescription(' ➕  Ajoute un nouvel emoji au serveur.').addStringOption(option => option.setName('nom').setDescription('Le nom du futur emoji').setRequired(true)).addAttachmentOption(option => option.setName('image').setDescription('L\'image de l\'emoji').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('info').setDescription(' ℹ️  Affiche des informations sur un emoji.').addStringOption(option => option.setName('emoji').setDescription('L\'emoji à inspecter').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove').setDescription(' 🗑️  Supprime un emoji personnalisé.').addStringOption(option => option.setName('emoji').setDescription('L\'emoji à supprimer').setRequired(true)))
        .setDMPermission(false),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const parseEmoji = (text) => {
            const match = text.match(/<?a?:?\w+:(\12|(\d+))>/);
            return match ? match[2] : text.match(/^\d+$/) ? text : null;
        };

        if (subcommand === 'voir') {
            const emojiRaw = interaction.options.getString('emoji');
            const emojiId = parseEmoji(emojiRaw);
            if (!emojiId) {
                const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Format d'emoji invalide.");
                return interaction.reply({ embeds: [errEmbed], ephemeral: true });
            }
            const isAnimated = emojiRaw.startsWith('<a:');
            const url = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?size=4096`;
            const embed = new EmbedBuilder().setTitle(`🔎 Zoom Emoji`).setImage(url).setColor(0x5865F2).setFooter({ text: `ID: ${emojiId}` });
            await interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === 'add') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                const noPermsEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Permission manquante : Gérer les emojis.");
                return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });
            }
            const name = interaction.options.getString('nom');
            const attachment = interaction.options.getAttachment('image');
            if (!attachment.contentType.startsWith('image/')) {
                const noImgEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Le fichier doit être une image.");
                return interaction.reply({ embeds: [noImgEmbed], ephemeral: true });
            }
            try {
                const emoji = await interaction.guild.emojis.create({ attachment: attachment.url, name: name });
                const embed = new EmbedBuilder().setTitle('✅ Emoji Créé').setDescription(`L'emoji ${emoji} (\`${name}\`) est prêt.`).setThumbnail(emoji.url).setColor(0x2ecc71);
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                const failEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Impossible de créer l'emoji. (Taille max 256kb)");
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
        else if (subcommand === 'info') {
            const emojiId = parseEmoji(interaction.options.getString('emoji'));
            const emoji = interaction.guild.emojis.cache.get(emojiId);
            if (!emoji) {
                const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Emoji introuvable sur ce serveur.");
                return interaction.reply({ embeds: [errEmbed], ephemeral: true });
            }
            const embed = new EmbedBuilder().setTitle(`ℹ️ Info Emoji : ${emoji.name}`).setThumbnail(emoji.url).addFields({ name: 'ID', value: `\`${emoji.id}\``, inline: true }, { name: 'Animé', value: emoji.animated ? 'Oui' : 'Non', inline: true }, { name: 'Date', value: `${time(emoji.createdAt, 'F')}`, inline: false }).setColor(0x3498db);
            await interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === 'remove') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                const noPermsEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Permission manquante.");
                return interaction.reply({ embeds: [noPermsEmbed], ephemeral: true });
            }
            const emojiId = parseEmoji(interaction.options.getString('emoji'));
            const emoji = interaction.guild.emojis.cache.get(emojiId);
            if (!emoji) {
                const errEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Emoji introuvable.");
                return interaction.reply({ embeds: [errEmbed], ephemeral: true });
            }
            try {
                const name = emoji.name;
                await emoji.delete();
                const successEmbed = new EmbedBuilder().setColor(0x2ecc71).setDescription(`🗑️ L'emoji \`${name}\` a été supprimé.`);
                await interaction.reply({ embeds: [successEmbed] });
            } catch (error) {
                const failEmbed = new EmbedBuilder().setColor(0xe74c3c).setDescription("❌ Erreur lors de la suppression.");
                await interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    },
};