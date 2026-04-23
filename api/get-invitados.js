const { getDb } = require('./lib/db');

module.exports = async (req, res) => {
    try {
        const db = getDb();
        const result = await db.execute('SELECT * FROM invitados ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching invitados:', error);
        res.status(500).json({ error: 'Error al obtener invitados' });
    }
};
