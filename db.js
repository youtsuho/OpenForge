const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'openforge',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connecté à la base de données MySQL via configuration .env.');

        // Table Bienvenue
        await connection.query(`
            CREATE TABLE IF NOT EXISTS welcome_settings (
                guild_id VARCHAR(255) PRIMARY KEY,
                enabled BOOLEAN DEFAULT FALSE,
                channel_id VARCHAR(255),
                role_id VARCHAR(255),
                title TEXT,
                description TEXT,
                color INT,
                footer TEXT,
                image TEXT,
                thumbnail TEXT
            )
        `);

        // Table Départ
        await connection.query(`
            CREATE TABLE IF NOT EXISTS leave_settings (
                guild_id VARCHAR(255) PRIMARY KEY,
                enabled BOOLEAN DEFAULT FALSE,
                channel_id VARCHAR(255),
                title TEXT,
                description TEXT,
                color INT,
                footer TEXT,
                image TEXT,
                thumbnail TEXT
            )
        `);

        // Table Configuration Tickets
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ticket_settings (
                guild_id VARCHAR(255) PRIMARY KEY,
                category_id VARCHAR(255),
                staff_role_id VARCHAR(255),
                logs_channel_id VARCHAR(255)
            )
        `);

        // Table des Tickets actifs
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                channel_id VARCHAR(255) PRIMARY KEY,
                guild_id VARCHAR(255),
                user_id VARCHAR(255),
                status VARCHAR(50) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Table des Sanctions (Historique)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sanctions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                guild_id VARCHAR(255),
                user_id VARCHAR(255),
                moderator_id VARCHAR(255),
                type VARCHAR(50),
                reason TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        try {
            await connection.query('ALTER TABLE welcome_settings ADD COLUMN role_id VARCHAR(255) AFTER channel_id');
        } catch (e) {}
        
        connection.release();
        console.log('✅ Tables de la base de données vérifiées/créées.');
    } catch (error) {
        console.error('❌ Erreur d\'initialisation de la base de données:', error);
    }
}

module.exports = { pool, initDatabase };