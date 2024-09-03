
module.exports = {
    handleCommand: async (command, args, message, sock) => {
        const chatId = message.key.remoteJid;

        try {
            switch (command) {
                case 'sayang': {
                        await sock.sendMessage(chatId, { text: 'Hm.... Kenapa Sayang?' });
                    }
                    break;

                default:
                    await sock.sendMessage(chatId, { text: 'Unknown command. Please use !yt, !tiktok, !ig, or !fb followed by the URL.' });
                    break;
            }
        } catch (err) {
            if (err.statusCode === 410) {
                await sock.sendMessage(chatId, { text: 'The requested URL is no longer available (410 Gone).' });
            } else {
                await sock.sendMessage(chatId, { text: `An error occurred: ${err.message}` });
            }
        }
    }
};
