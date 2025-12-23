/*
Pseudo-code overview of MapConfig.js:
1. Define a MapData class to structure map-specific parameters (spawn, time, win condition).
2. Create a collection (MAPS) to store different level configurations.
3. Export a CURRENT_MAP constant that points to the active level (currently 'level1').
*/

export class MapData {
    constructor({ key, texture, spawnX, spawnY, timeLimit, winRatio, showCoverage }) {
        this.key = key;           // Unique ID for the level
        this.texture = texture;   // Asset key for the background image
        this.spawnX = spawnX;     // Player start X
        this.spawnY = spawnY;     // Player start Y (and End Zone position)
        this.timeLimit = timeLimit; // Timer in seconds
        this.winRatio = winRatio; // Required track coverage (0.1 = 10%)
        this.showCoverage = showCoverage; // Toggle progress text
    }
}

// Define your maps here
export const MAPS = {
    level1: new MapData({
        key: 'level1',
        texture: 'background',
        spawnX: 700,
        spawnY: 300,
        timeLimit: 100, // seconds
        winRatio: 0.2, // 15% coverage required
        showCoverage: false // Toggle this to hide/show running coverage percentage
    }),
    // Future maps can be added here easily:
    // level2: new MapData({ ... })
};

// Change this to switch levels!
export const CURRENT_MAP = MAPS.level1;