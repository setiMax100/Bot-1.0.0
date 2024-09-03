const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fitur = require('./src/system/fitur');
const { createLogger, format, transports } = require('winston');

// Setup winston logger
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.colorize(),
        format.simple()
    ),
    transports: [
        new transports.Console({
            format: format.printf(({ level, message }) => {
                return `${level}: ${message}`;
            })
        })
    ]
});

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            logger.info(`connection closed due to ${lastDisconnect.error}, reconnecting ${shouldReconnect}`);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            logger.info('opened connection');
        } else if (qr) {
            qrcode.generate(qr, { small: true });
        }
    });

    let lastCommandTime = 0;

    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        const currentTime = Date.now();

        if (currentTime - lastCommandTime < 5000) {
            return;
        }

        if (!message.message.conversation.startsWith('.')) {
            return; // Tidak merespons jika teks tidak diawali oleh prefix '!'
        }

        const args = message.message.conversation.slice(1).split(' '); // Menghapus prefix '!' sebelum memisahkan argumen
        const command = args[0].toLowerCase();

        lastCommandTime = currentTime;
        const response = await fitur.handleCommand(command, args.slice(1), message, sock);
        
const chalk = await import('chalk');

        // Log ID pengirim dan respon
        console.log(chalk.default.green(message.key.remoteJid), chalk.default.yellow(message.message.conversation), response ? chalk.default.blue('true') : chalk.default.red('false'));
    });
}

connectToWhatsApp();
