const OpenAI = require('openai');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDOaeEgPdKWxeM6uVu5NWmMhCw1nrZOZ-g');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const openai = new OpenAI({
    apiKey: 'sk-TP3xC3QnxydcKofdz5MAiosHMHFF-cZloO_pVKL9xDT3BlbkFJUv6Hci3Krmc8tc6L7KiDHK7pgUwElHKlyle7UXOnMA', // Ganti dengan API key OpenAI kamu
});

module.exports = {
    handleCommand: async (command, args, message, sock) => {
        const chatId = message.key.remoteJid;

        try {
            switch (command) {
                case 'sayang': {
                    await sock.sendMessage(chatId, { text: 'Hm.... Kenapa Sayang?' }, { readReceipts: false });
                    break;
                }
                case 'longtext': {
                    let saw = await fetchJson('./src/admin/database/longtext.json');
                    let sawa = saw[Math.floor(Math.random() * saw.length)];
                    await sock.sendMessage(chatId, { text: sawa }, { readReceipts: false });
                    break;
                }
                      break;
                case 'reminder': {
                    if (!args[0] || !args[1] || !args[2]) {
                        await sock.sendMessage(chatId, { text: `Format salah. Gunakan: \n\n.reminder [waktu] detik/menit/jam [pesan]\n\nContoh: .reminder 1 m pesanmu\n\nMenit = m\nDetik = d\nJam = j` }, { readReceipts: false });
                        return;
                    }
                    const time = parseInt(args[0]) * (args[1].match(/(m|minute)/i) ? 60 : args[1].match(/(h|hour)/i) ? 3600 : 1) * 1000;
                    const reminderMessage = args.slice(2).join(' ');
                    setTimeout(async () => {
                        const participant = message.key.participant || message.key.remoteJid; // Gunakan remoteJid jika participant tidak ada
                        await sock.sendMessage(chatId, {
                            text: `Hai @${participant.split("@")[0]}, Aku hanya mengingatkan nih\n *${reminderMessage}*`,
                            contextInfo: {
                                mentionedJid: [participant]
                            }
                        }, { quoted: message });
                    }, time);
                    await sock.sendMessage(chatId, { text: `Reminder telah diatur untuk ${args[0]} ${args[1]}\n\nAku akan mengingatkanmu nanti ya` }, { readReceipts: false });
                    break;
                }
                case 'gemini': {
                    const prompt = args.join(' ');
                    model.generateContent(prompt)
                    .then(async (result) => {
                        await sock.sendMessage(chatId, { text: result.response.text() }, { readReceipts: false });
                    })
                    .catch(async (err) => {
                        await sock.sendMessage(chatId, { text: `An error occurred: ${err.message}` }, { readReceipts: false });
                    });
                    break;
                }                
                case 'aia': {
                    const prompt = args.join(' ');
                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are a helpful assistant." },
                            { role: "user", content: prompt },
                        ],
                    });
                    await sock.sendMessage(chatId, { text: completion.choices[0].message.content }, { readReceipts: false });
                    break;
                }
            }
        } catch (err) {
            if (err.statusCode === 410) {
                await sock.sendMessage(chatId, { text: 'The requested URL is no longer available (410 Gone).' }, { readReceipts: false });
            } else {
                await sock.sendMessage(chatId, { text: `An error occurred: ${err.message}` }, { readReceipts: false });
            }
        }
    }
};

async function fetchJson(filePath) {
    const fs = require('fs').promises;
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}
