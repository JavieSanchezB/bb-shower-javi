const { getDb } = require('./lib/db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    
    try {
        const { id, regalo, referencia_url } = req.body;
        const db = getDb();
        
        await db.execute({
            sql: 'UPDATE invitados SET regalo = ?, referencia_url = ? WHERE id = ?',
            args: [regalo, referencia_url || '', id]
        });
        
        res.status(200).json({ success: true, message: 'Regalo guardado exitosamente.' });
    } catch (error) {
        console.error('Error saving regalo:', error);
        res.status(500).json({ success: false, message: 'Error procesando la solicitud.' });
    }
};
