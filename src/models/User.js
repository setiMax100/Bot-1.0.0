const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    hp: { type: Number, default: 100 },
    attack: { type: Number, default: 10 },
    defense: { type: Number, default: 5 },
    items: { type: Array, default: [] },
    inDungeon: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
