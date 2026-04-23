const { getDb } = require('./lib/db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    
    try {
        const { regalos } = req.body;
        const db = getDb();
        
        const stmts = [];
        stmts.push('DELETE FROM catalogo');
        
        for (const r of regalos) {
            stmts.push({
                sql: 'INSERT INTO catalogo (categoria, nombre, imagen, alt) VALUES (?, ?, ?, ?)',
                args: [r.categoria, r.nombre, r.imagen || '', r.alt || '']
            });
        }
        
        await db.batch(stmts, 'write');
        
        res.status(200).json({ success: true, message: 'Catálogo actualizado exitosamente.' });
    } catch (error) {
        console.error('Error guardando catálogo:', error);
        res.status(500).json({ success: false, message: 'Error procesando la solicitud.' });
    }
};
