const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const path = require('path'); // <-- Necesario para las rutas de archivos

// --- BASE DE DATOS ---
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ alumnos: [], registrosPendientes: [] }).write();

const app = express();
app.use(cors());
app.use(express.json());

// --- SERVIR FRONTEND (REACT) ---
// Importante: Esto debe ir ANTES de las rutas del bot
app.use(express.static(path.join(__dirname, 'build')));

// --- CLIENTE WHATSAPP ---
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-zygote'] 
    }
});

// --- LÓGICA DE MENSAJERÍA (Se mantiene igual) ---
client.on('message', async (msg) => {
    if (msg.from.includes('@g.us')) return;
    const text = msg.body.toLowerCase().trim();
    const numeroLimpio = msg.from.split('@')[0];

    try {
        const data = JSON.parse(fs.readFileSync('./respuestas.json', 'utf8'));
        const pendiente = db.get('registrosPendientes').find({ numero: numeroLimpio }).value();

        if (pendiente) {
            const nombreAlumno = msg.body.trim();
            db.get('alumnos').push({ 
                id: Date.now(), 
                nombre: nombreAlumno, 
                numero: numeroLimpio, 
                cita: pendiente.fecha,
                creado: new Date().toISOString()
            }).write();
            db.get('registrosPendientes').remove({ numero: numeroLimpio }).write();
            await msg.reply(`🤟 ¡Perfecto *${nombreAlumno}*! Tu cupo para el *${pendiente.fecha}* está reservado.`);
            return;
        }

        if (text.startsWith('agendar')) {
            const fecha = msg.body.replace(/agendar/i, '').trim();
            if (!fecha) {
                await msg.reply("❌ Por favor indica el día y hora. Ejemplo: *agendar martes 18:00*");
                return;
            }
            db.get('registrosPendientes').push({ numero: numeroLimpio, fecha }).write();
            await msg.reply("✨ ¡Excelente! ¿Cuál es tu nombre completo para inscribirte en el curso?");
            return;
        }

        if (['hola', 'menu', 'menú', 'inicio'].includes(text)) {
            await msg.reply(data.menuPrincipal);
        }
    } catch (e) { console.error("Error en el bot:", e); }
});

// Eventos QR y Ready
client.on('qr', qr => {
    console.log('--- ESCANEA EL QR ---');
    qrcode.generate(qr, { small: true });
});
client.on('ready', () => console.log('✅ Bot conectado'));
client.initialize();

// --- API PARA REACT NATIVE ---
app.get('/api/alumnos', (req, res) => res.json(db.get('alumnos').value()));
app.get('/api/registrosPendientes', (req, res) => res.json(db.get('registrosPendientes').value()));
app.delete('/api/alumnos/:id', (req, res) => {
    db.get('alumnos').remove({ id: parseInt(req.params.id) }).write();
    res.json({ success: true });
});

// --- RUTA FINAL PARA REACT ---
// Esto hace que si refrescas la página en una ruta que no existe, cargue el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// PUERTO DINÁMICO (Fundamental para la nube)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});