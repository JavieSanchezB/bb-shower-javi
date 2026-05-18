const { getDb } = require('./lib/db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

    try {
        const { id, asistencia } = req.body;
        const valor = (asistencia || '').toLowerCase();

        if (!id || (valor !== 'asiste' && valor !== 'no asiste')) {
            return res.status(400).json({ success: false, message: 'Datos invalidos para asistencia.' });
        }

        const db = getDb();
        await db.execute({
            sql: 'UPDATE invitados SET asistencia = ? WHERE id = ?',
            args: [valor, id]
        });

        res.status(200).json({ success: true, message: 'Asistencia guardada exitosamente.' });
    } catch (error) {
        console.error('Error saving asistencia:', error);
        res.status(500).json({ success: false, message: 'Error procesando la solicitud.' });
    }
};
