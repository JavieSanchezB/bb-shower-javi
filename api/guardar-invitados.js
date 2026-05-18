const { getDb } = require('./lib/db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    
    try {
        const invitados = req.body;
        const db = getDb();
        
        const stmts = [];
        stmts.push('DELETE FROM invitados');
        
        for (const i of invitados) {
            stmts.push({
                sql: 'INSERT INTO invitados (id, invitados, cupo, regalo, referencia_url, enviado, asistencia) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [i.id, i.invitados, i.cupo, i.regalo || '', i.referencia_url || '', i.enviado ? 1 : 0, i.asistencia || '']
            });
        }
        
        await db.batch(stmts, 'write');
        
        res.status(200).json({ success: true, message: 'Invitados actualizados exitosamente.' });
    } catch (error) {
        console.error('Error guardando invitados:', error);
        res.status(500).json({ success: false, message: 'Error procesando la solicitud.' });
    }
};
