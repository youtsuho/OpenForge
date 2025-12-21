const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-builder')
        .setDescription(' 🏗️  Ouvre un constructeur d\'embed interactif et complet.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    
    async execute(interaction) {
        // État initial de l'embed
        let embedState = {
            title: 'Titre de l\'aperçu',
            description: 'Ceci est la description de votre futur embed. Cliquez sur les boutons ci-dessous pour modifier ce contenu !',
            color: 0xFF5733,
            footer: 'Forgeur d\'Embed • OpenForge',
            timestamp: true,
            image: null,
            thumbnail: null,
            url: null
        };

        const generatePreview = () => {
            const preview = new EmbedBuilder()
                .setTitle(embedState.title || null)
                .setDescription(embedState.description || null)
                .setColor(embedState.color)
                .setFooter({ text: embedState.footer || 'OpenForge' })
                .setURL(embedState.url || null)
                .setImage(embedState.image || null)
                .setThumbnail(embedState.thumbnail || null);
            
            if (embedState.timestamp) preview.setTimestamp();
            return preview;
        };

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('eb_text').setLabel('📝 Texte').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('eb_style').setLabel('🎨 Style').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('eb_media').setLabel('🖼️ Médias').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('eb_send').setLabel('🚀 Envoyer').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('eb_cancel').setLabel('✖️ Annuler').setStyle(ButtonStyle.Danger)
        );

        const response = await interaction.reply({
            content: '🏗️ **Constructeur d\'Embed Interactif**\nModifiez votre message à l\'aide des boutons. Une fois terminé, cliquez sur **Envoyer**.',
            embeds: [generatePreview()],
            components: [buttons],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ time: 600000 }); // 10 minutes

        collector.on('collect', async i => {
            if (i.customId === 'eb_cancel') {
                await i.update({ content: '❌ Création annulée.', embeds: [], components: [] });
                return collector.stop();
            }

            if (i.customId === 'eb_send') {
                await interaction.channel.send({ embeds: [generatePreview()] });
                await i.update({ content: '✅ Embed envoyé avec succès dans ce salon !', components: [] });
                return collector.stop();
            }

            // Gestion des Modals selon le bouton
            let modal;
            if (i.customId === 'eb_text') {
                modal = new ModalBuilder().setCustomId('m_text').setTitle('Modifier les Textes');
                const titleInput = new TextInputBuilder().setCustomId('title').setLabel('Titre').setValue(embedState.title || '').setStyle(TextInputStyle.Short).setRequired(false);
                const descInput = new TextInputBuilder().setCustomId('desc').setLabel('Description').setValue(embedState.description || '').setStyle(TextInputStyle.Paragraph).setRequired(false);
                const footerInput = new TextInputBuilder().setCustomId('footer').setLabel('Texte du bas (Footer)').setValue(embedState.footer || '').setStyle(TextInputStyle.Short).setRequired(false);
                modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(descInput), new ActionRowBuilder().addComponents(footerInput));
            } 
            else if (i.customId === 'eb_style') {
                modal = new ModalBuilder().setCustomId('m_style').setTitle('Modifier le Style');
                const colorInput = new TextInputBuilder().setCustomId('color').setLabel('Couleur Hex (ex: #FF5733)').setValue('#' + embedState.color.toString(16)).setStyle(TextInputStyle.Short).setRequired(false);
                const urlInput = new TextInputBuilder().setCustomId('url').setLabel('URL du Titre').setValue(embedState.url || '').setStyle(TextInputStyle.Short).setRequired(false);
                modal.addComponents(new ActionRowBuilder().addComponents(colorInput), new ActionRowBuilder().addComponents(urlInput));
            }
            else if (i.customId === 'eb_media') {
                modal = new ModalBuilder().setCustomId('m_media').setTitle('Modifier les Médias');
                const imgInput = new TextInputBuilder().setCustomId('image').setLabel('URL Grande Image').setValue(embedState.image || '').setStyle(TextInputStyle.Short).setRequired(false);
                const thumbInput = new TextInputBuilder().setCustomId('thumb').setLabel('URL Miniature (Haut droite)').setValue(embedState.thumbnail || '').setStyle(TextInputStyle.Short).setRequired(false);
                modal.addComponents(new ActionRowBuilder().addComponents(imgInput), new ActionRowBuilder().addComponents(thumbInput));
            }

            await i.showModal(modal);

            try {
                const submit = await i.awaitModalSubmit({ time: 300000 });
                if (submit.customId === 'm_text') {
                    embedState.title = submit.fields.getTextInputValue('title');
                    embedState.description = submit.fields.getTextInputValue('desc');
                    embedState.footer = submit.fields.getTextInputValue('footer');
                } else if (submit.customId === 'm_style') {
                    const colorVal = submit.fields.getTextInputValue('color').replace('#', '');
                    embedState.color = isNaN(parseInt(colorVal, 16)) ? 0xFF5733 : parseInt(colorVal, 16);
                    embedState.url = submit.fields.getTextInputValue('url');
                } else if (submit.customId === 'm_media') {
                    embedState.image = submit.fields.getTextInputValue('image') || null;
                    embedState.thumbnail = submit.fields.getTextInputValue('thumb') || null;
                }
                
                await submit.update({ embeds: [generatePreview()] });
            } catch (err) {
                console.log('Délai d\'attente du modal dépassé ou erreur.');
            }
        });
    },
};