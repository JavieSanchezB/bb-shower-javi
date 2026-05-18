const { getDb } = require('./lib/db');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    try {
        const db = getDb();
        
        // 1. Create tables
        await db.execute(`
            CREATE TABLE IF NOT EXISTS invitados (
                id INTEGER PRIMARY KEY,
                invitados TEXT NOT NULL,
                cupo INTEGER NOT NULL,
                regalo TEXT,
                referencia_url TEXT,
                enviado BOOLEAN DEFAULT 0,
                asistencia TEXT DEFAULT ''
            )
        `);
        
        try {
            await db.execute('ALTER TABLE invitados ADD COLUMN enviado BOOLEAN DEFAULT 0');
        } catch (e) {
            // Ignorar el error si la columna ya existe
        }

        try {
            await db.execute("ALTER TABLE invitados ADD COLUMN asistencia TEXT DEFAULT ''");
        } catch (e) {
            // Ignorar el error si la columna ya existe
        }
        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS catalogo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categoria TEXT,
                nombre TEXT,
                imagen TEXT,
                alt TEXT
            )
        `);

        // Check if there are already records
        const { rows: invitadosRows } = await db.execute('SELECT count(*) as count FROM invitados');
        
        if (invitadosRows[0].count === 0) {
            // Insert from local file
            const invPath = path.join(process.cwd(), 'invitados.json');
            if (fs.existsSync(invPath)) {
                const invitados = JSON.parse(fs.readFileSync(invPath, 'utf8'));
                const stmts = [];
                for (const i of invitados) {
                    stmts.push({
                        sql: 'INSERT INTO invitados (id, invitados, cupo, regalo, referencia_url, enviado, asistencia) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        args: [i.id, i.invitados, i.cupo, i.regalo || '', i.referencia_url || '', i.enviado ? 1 : 0, i.asistencia || '']
                    });
                }
                if (stmts.length > 0) {
                    await db.batch(stmts, 'write');
                }
            }
        }

        const { rows: catalogoRows } = await db.execute('SELECT count(*) as count FROM catalogo');
        if (catalogoRows[0].count === 0) {
            const catPath = path.join(process.cwd(), 'regalos.json');
            if (fs.existsSync(catPath)) {
                const { regalos } = JSON.parse(fs.readFileSync(catPath, 'utf8'));
                const stmts = [];
                for (const r of regalos) {
                    stmts.push({
                        sql: 'INSERT INTO catalogo (categoria, nombre, imagen, alt) VALUES (?, ?, ?, ?)',
                        args: [r.categoria, r.nombre, r.imagen || '', r.alt || '']
                    });
                }
                if (stmts.length > 0) {
                    await db.batch(stmts, 'write');
                }
            }
        }

        res.status(200).json({ success: true, message: 'Base de datos inicializada y poblada correctamente.' });
    } catch (error) {
        console.error('Error inicializando db:', error);
        res.status(500).json({ error: 'Error inicializando DB', details: error.message });
    }
};
