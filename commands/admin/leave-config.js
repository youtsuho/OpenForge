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
const { pool } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave-config')
        .setDescription(' 🏃  Configure le système de message de départ (SQL).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;

        let [rows] = await pool.execute('SELECT * FROM leave_settings WHERE guild_id = ?', [guildId]);
        
        let config;
        if (rows.length > 0) {
            config = {
                enabled: Boolean(rows[0].enabled),
                channelId: rows[0].channel_id,
                embed: {
                    title: rows[0].title || 'Un membre nous a quittés',
                    description: rows[0].description || '{username} a quitté le serveur. Nous sommes désormais {memberCount}.',
                    color: rows[0].color || 0xe74c3c,
                    footer: rows[0].footer || '{server}',
                    image: rows[0].image,
                    thumbnail: rows[0].thumbnail
                }
            };
        } else {
            config = {
                enabled: false,
                channelId: null,
                embed: {
                    title: 'Un membre nous a quittés',
                    description: '{username} a quitté le serveur. Nous sommes désormais {memberCount}.',
                    color: 0xe74c3c,
                    footer: '{server}',
                    image: null,
                    thumbnail: null
                }
            };
        }

        const replacePlaceholders = (text, user, guild) => {
            if (!text) return "";
            return text
                .replace(/{user}/g, user.tag)
                .replace(/{username}/g, user.username)
                .replace(/{server}/g, guild.name)
                .replace(/{memberCount}/g, guild.memberCount.toString());
        };

        const generatePreview = () => {
            const embed = new EmbedBuilder()
                .setTitle(replacePlaceholders(config.embed.title, interaction.user, interaction.guild))
                .setDescription(replacePlaceholders(config.embed.description, interaction.user, interaction.guild))
                .setColor(config.embed.color)
                .setFooter({ text: replacePlaceholders(config.embed.footer, interaction.user, interaction.guild) || 'OpenForge' })
                .setThumbnail(config.embed.thumbnail || null)
                .setImage(config.embed.image || null);
            return embed;
        };

        const getComponents = () => {
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('l_toggle').setLabel(config.enabled ? 'Désactiver' : 'Activer').setStyle(config.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
                new ButtonBuilder().setCustomId('l_channel').setLabel('Salon').setStyle(ButtonStyle.Secondary).setEmoji('📍'),
                new ButtonBuilder().setCustomId('l_text').setLabel('Textes').setStyle(ButtonStyle.Primary).setEmoji('📝')
            );
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('l_style').setLabel('Couleur').setStyle(ButtonStyle.Primary).setEmoji('🎨'),
                new ButtonBuilder().setCustomId('l_media').setLabel('Images').setStyle(ButtonStyle.Primary).setEmoji('🖼️'),
                new ButtonBuilder().setCustomId('l_save').setLabel('Sauvegarder').setStyle(ButtonStyle.Success).setEmoji('💾')
            );
            return [row1, row2];
        };

        const getContent = () => {
            return `🗄️ **Configuration Départ (SQL)**\nStatus: ${config.enabled ? '✅ Actif' : '❌ Inactif'}\nSalon: ${config.channelId ? `<#${config.channelId}>` : '*Non défini*'}\n\n*Variables : {user}, {username}, {server}, {memberCount}*`;
        };

        const response = await interaction.reply({
            content: getContent(),
            embeds: [generatePreview()],
            components: [getComponents()],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({ time: 600000 });

        collector.on('collect', async i => {
            if (i.customId === 'l_toggle') {
                config.enabled = !config.enabled;
                await i.update({ content: getContent(), components: getComponents() });
            } 

            else if (i.customId === 'l_channel') {
                const modal = new ModalBuilder().setCustomId('m_l_chan').setTitle('Salon de départ');
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('chan_id').setLabel('ID du salon textuel').setValue(config.channelId || '').setStyle(TextInputStyle.Short).setRequired(true)
                ));
                await i.showModal(modal);
                
                try {
                    const submit = await i.awaitModalSubmit({ time: 600000 });
                    config.channelId = submit.fields.getTextInputValue('chan_id');
                    await submit.update({ content: getContent(), embeds: [generatePreview()] });
                } catch (e) {}
            }

            else if (i.customId === 'l_text') {
                const modal = new ModalBuilder().setCustomId('m_l_text').setTitle('Modifier les textes');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Titre').setValue(config.embed.title || '').setStyle(TextInputStyle.Short)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Description').setValue(config.embed.description || '').setStyle(TextInputStyle.Paragraph)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('footer').setLabel('Bas de page').setValue(config.embed.footer || '').setStyle(TextInputStyle.Short))
                );
                await i.showModal(modal);

                try {
                    const submit = await i.awaitModalSubmit({ time: 600000 });
                    config.embed.title = submit.fields.getTextInputValue('title');
                    config.embed.description = submit.fields.getTextInputValue('desc');
                    config.embed.footer = submit.fields.getTextInputValue('footer');
                    await submit.update({ content: getContent(), embeds: [generatePreview()] });
                } catch (e) {}
            }

            else if (i.customId === 'l_style') {
                const modal = new ModalBuilder().setCustomId('m_l_style').setTitle('Modifier la couleur');
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('color').setLabel('Couleur Hex (ex: #e74c3c)').setValue('#' + config.embed.color.toString(16).padStart(6, '0')).setStyle(TextInputStyle.Short)
                ));
                await i.showModal(modal);

                try {
                    const submit = await i.awaitModalSubmit({ time: 600000 });
                    const colorVal = submit.fields.getTextInputValue('color').replace('#', '');
                    config.embed.color = isNaN(parseInt(colorVal, 16)) ? 0xe74c3c : parseInt(colorVal, 16);
                    await submit.update({ content: getContent(), embeds: [generatePreview()] });
                } catch (e) {}
            }

            else if (i.customId === 'l_media') {
                const modal = new ModalBuilder().setCustomId('m_l_media').setTitle('Modifier les images');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('img').setLabel('Grande Image (URL)').setValue(config.embed.image || '').setStyle(TextInputStyle.Short).setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('thumb').setLabel('Miniature (URL)').setValue(config.embed.thumbnail || '').setStyle(TextInputStyle.Short).setRequired(false))
                );
                await i.showModal(modal);

                try {
                    const submit = await i.awaitModalSubmit({ time: 600000 });
                    config.embed.image = submit.fields.getTextInputValue('img') || null;
                    config.embed.thumbnail = submit.fields.getTextInputValue('thumb') || null;
                    await submit.update({ content: getContent(), embeds: [generatePreview()] });
                } catch (e) {}
            }

            else if (i.customId === 'l_save') {
                try {
                    await pool.execute(`
                        INSERT INTO leave_settings (guild_id, enabled, channel_id, title, description, color, footer, image, thumbnail)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                        enabled = VALUES(enabled), 
                        channel_id = VALUES(channel_id), 
                        title = VALUES(title), 
                        description = VALUES(description), 
                        color = VALUES(color), 
                        footer = VALUES(footer), 
                        image = VALUES(image), 
                        thumbnail = VALUES(thumbnail)
                    `, [
                        guildId, config.enabled, config.channelId, 
                        config.embed.title, config.embed.description, config.embed.color, 
                        config.embed.footer, config.embed.image, config.embed.thumbnail
                    ]);
                    
                    await i.update({ content: '✅ Configuration des départs sauvegardée !', components: [], embeds: [generatePreview()] });
                    collector.stop();
                } catch (err) {
                    console.error(err);
                    await i.reply({ content: '❌ Erreur SQL lors de la sauvegarde.', ephemeral: true });
                }
            }
        });
    },
};