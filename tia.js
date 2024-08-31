const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const connectDB = require('./src/config/db');
const { getPlayer, savePlayer, enterDungeon, leaveDungeon, pvp, fightMonster } = require('./src/system/rpg');

connectDB();

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    if (!msg.from.includes('@g.us')) {
        msg.reply('Fitur RPG hanya bisa digunakan di grup.');
        return;
    }

    if (msg.body.startsWith('!dungeon ')) {
        const floor = parseInt(msg.body.split(' ')[1]);
        const result = await enterDungeon(msg.from, floor);
        msg.reply(result);
    } else if (msg.body.startsWith('!leave')) {
        await leaveDungeon(msg.from);
        msg.reply('Anda telah keluar dari dungeon.');
    } else if (msg.body.startsWith('!pvp ')) {
        const opponentId = msg.body.split(' ')[1];
        const result = await pvp(msg.from, opponentId);
        msg.reply(result);
    } else if (msg.body.startsWith('!status')) {
        const player = await getPlayer(msg.from);
        msg.reply(`Status Anda:\nLevel: ${player.level}\nXP: ${player.xp}\nHP: ${player.hp}\nAttack: ${player.attack}\nDefense: ${player.defense}`);
    } else if (msg.body.startsWith('!fight ')) {
        const monsterId = msg.body.split(' ')[1];
        const result = await fightMonster(msg.from, monsterId);
        msg.reply(result);
    }
});

client.initialize();
