const { createClient } = require("@libsql/client");

const getDb = () => {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        console.warn("Faltan credenciales de Turso (TURSO_DATABASE_URL o TURSO_AUTH_TOKEN).");
    }
    
    return createClient({
        url: process.env.TURSO_DATABASE_URL || "file:local.db",
        authToken: process.env.TURSO_AUTH_TOKEN,
    });
};

module.exports = { getDb };
