const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Endpoint Backend para guardar el regalo
    if (req.method === 'POST' && req.url === '/api/guardar-regalo') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { id, regalo, referencia_url } = data;
                
                const filePath = path.join(__dirname, 'invitados.json');
                const fileData = fs.readFileSync(filePath, 'utf8');
                const invitados = JSON.parse(fileData);
                
                const index = invitados.findIndex(i => i.id.toString() === id.toString());
                if (index !== -1) {
                    invitados[index].regalo = regalo;
                    if (referencia_url) {
                        invitados[index].referencia_url = referencia_url;
                    }
                    fs.writeFileSync(filePath, JSON.stringify(invitados, null, 2));
                    console.log(`Regalo "${regalo}" guardado para ID ${id}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Regalo guardado exitosamente.' }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Invitado no encontrado.' }));
                }
            } catch (err) {
                console.error('Error interno:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Error procesando la solicitud.' }));
            }
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/guardar-catalogo') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const newCatalog = JSON.parse(body);
                const catalogPath = path.join(__dirname, 'regalos.json');
                fs.writeFileSync(catalogPath, JSON.stringify(newCatalog, null, 2));
                console.log(`Catálogo de regalos actualizado guardado.`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Catálogo actualizado exitosamente.' }));
            } catch (err) {
                console.error('Error guardando catálogo:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Error procesando la solicitud.' }));
            }
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/guardar-invitados') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const updatedInvitados = JSON.parse(body);
                const catalogPath = path.join(__dirname, 'invitados.json');
                fs.writeFileSync(catalogPath, JSON.stringify(updatedInvitados, null, 2));
                console.log(`Lista principal de invitados actualizada en tiempo real.`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Invitados actualizados exitosamente.' }));
            } catch (err) {
                console.error('Error guardando invitados:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Error procesando la solicitud.' }));
            }
        });
        return;
    }

    // Servidor Estático
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('Archivo no encontrado', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Error de servidor: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});

server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  SERVIDO CON BACKEND INICIADO CORRECTAMENTE   `);
    console.log(`  Escuchando en: http://localhost:${PORT}      `);
    console.log(`===============================================`);
});
