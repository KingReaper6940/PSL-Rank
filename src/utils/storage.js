import { seedMoggers } from '../data/seedData';

const MOGGERS_KEY = 'pslrank_moggers';
const MATCHES_KEY = 'pslrank_matches';
const STATS_KEY = 'pslrank_stats';
const VERSION_KEY = 'pslrank_version';
const CURRENT_VERSION = '2'; // Bump this to force reseed

export function initializeData() {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
        // Reset everything with fresh seed data
        localStorage.removeItem(MOGGERS_KEY);
        localStorage.removeItem(MATCHES_KEY);
        localStorage.removeItem(STATS_KEY);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
    if (!localStorage.getItem(MOGGERS_KEY)) {
        localStorage.setItem(MOGGERS_KEY, JSON.stringify(seedMoggers));
    }
    if (!localStorage.getItem(MATCHES_KEY)) {
        localStorage.setItem(MATCHES_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STATS_KEY)) {
        localStorage.setItem(STATS_KEY, JSON.stringify({ totalVotes: 0 }));
    }
}

export function getMoggers() {
    const data = localStorage.getItem(MOGGERS_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveMoggers(moggers) {
    localStorage.setItem(MOGGERS_KEY, JSON.stringify(moggers));
}

export function getMoggerById(id) {
    const moggers = getMoggers();
    return moggers.find(m => m.id === id);
}

export function updateMogger(updatedMogger) {
    const moggers = getMoggers();
    const index = moggers.findIndex(m => m.id === updatedMogger.id);
    if (index !== -1) {
        moggers[index] = updatedMogger;
        saveMoggers(moggers);
    }
}

export function addMogger(mogger) {
    const moggers = getMoggers();
    const newMogger = {
        ...mogger,
        id: Date.now().toString(),
        elo: 1200,
        wins: 0,
        losses: 0,
        matches: [],
        eloHistory: [1200],
        dateAdded: new Date().toISOString().split('T')[0],
    };
    moggers.push(newMogger);
    saveMoggers(moggers);
    return newMogger;
}

export function getMatches() {
    const data = localStorage.getItem(MATCHES_KEY);
    return data ? JSON.parse(data) : [];
}

export function addMatch(match) {
    const matches = getMatches();
    matches.unshift({
        ...match,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
    });
    // Keep only last 500 matches
    if (matches.length > 500) matches.length = 500;
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));

    // Update total votes
    const stats = getStats();
    stats.totalVotes = (stats.totalVotes || 0) + 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getStats() {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : { totalVotes: 0 };
}

export function getRandomMatchup() {
    const moggers = getMoggers();
    if (moggers.length < 2) return null;

    const i = Math.floor(Math.random() * moggers.length);
    let j = Math.floor(Math.random() * (moggers.length - 1));
    if (j >= i) j++;

    return [moggers[i], moggers[j]];
}

export function resetAllData() {
    localStorage.removeItem(MOGGERS_KEY);
    localStorage.removeItem(MATCHES_KEY);
    localStorage.removeItem(STATS_KEY);
    initializeData();
}
