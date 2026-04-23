require('dotenv').config();
const dbInit = require('./api/db-init');

const req = {};
const res = {
    status: (code) => ({
        json: (data) => console.log(`Status: ${code}`, data)
    })
};

console.log("Iniciando migración a Turso...");
dbInit(req, res);
