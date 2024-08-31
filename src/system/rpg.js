const User = require('../models/User');

async function getPlayer(id) {
    let player = await User.findOne({ userId: id });
    if (!player) {
        player = new User({ userId: id });
        await player.save();
    }
    return player;
}

async function savePlayer(player) {
    await player.save();
}

async function battle(player, monster) {
    let result = `Pertarungan antara ${player.userId} dan ${monster.name}!\n`;
    while (player.hp > 0 && monster.hp > 0) {
        monster.hp -= player.attack - monster.defense;
        if (monster.hp > 0) {
            player.hp -= monster.attack - player.defense;
        }
    }
    if (player.hp > 0) {
        result += `${player.userId} menang!\n`;
        player.xp += monster.level * 10;
        if (player.xp >= player.level * 100) {
            player.level += 1;
            player.xp = 0;
            player.hp += 20;
            player.attack += 5;
            player.defense += 3;
            result += `${player.userId} naik level ke ${player.level}!\n`;
        }
    } else {
        result += `${monster.name} menang!\n`;
    }
    await savePlayer(player);
    return result;
}

async function enterDungeon(playerId, floor) {
    const player = await getPlayer(playerId);
    player.inDungeon = true;
    const eligibleMonsters = monsters.filter(monster => monster.level <= floor);
    const monster = eligibleMonsters[Math.floor(Math.random() * eligibleMonsters.length)];
    const result = await battle(player, monster);
    await savePlayer(player);
    return result;
}

async function leaveDungeon(playerId) {
    const player = await getPlayer(playerId);
    player.inDungeon = false;
    await savePlayer(player);
}

async function pvp(playerId, opponentId) {
    const player = await getPlayer(playerId);
    const opponent = await getPlayer(opponentId);

    if (player.inDungeon || opponent.inDungeon) {
        return 'PvP tidak bisa dilakukan di dungeon!';
    }

    let result = `PvP antara ${player.userId} dan ${opponent.userId}!\n`;
    while (player.hp > 0 && opponent.hp > 0) {
        opponent.hp -= player.attack - opponent.defense;
        if (opponent.hp > 0) {
            player.hp -= opponent.attack - player.defense;
        }
    }
    if (player.hp > 0) {
        result += `${player.userId} menang!\n`;
        player.xp += opponent.level * 10;
        player.level += opponent.level;
        player.items.push(...opponent.items);
        opponent.items = [];
    } else {
        result += `${opponent.userId} menang!\n`;
        opponent.xp += player.level * 10;
        opponent.items.push(...player.items);
        player.items = [];
    }
    await savePlayer(player);
    await savePlayer(opponent);
    return result;
}

async function fightMonster(playerId, monsterId) {
    const player = await getPlayer(playerId);
    const monster = monsters.find(monster => monster.id === parseInt(monsterId));
    if (!monster) {
        return 'Monster tidak ditemukan!';
    }
    const result = await battle(player, monster);
    await savePlayer(player);
    return result;
}

module.exports = {
    getPlayer,
    savePlayer,
    enterDungeon,
    leaveDungeon,
    pvp,
    fightMonster
};
