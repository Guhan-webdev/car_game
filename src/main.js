/*
Pseudo‑code overview of main.js:
1. Import the RaceScene class.
2. Define Phaser game configuration (type, size, physics, scene).
3. Create a new Phaser.Game instance with the config.
*/
import { RaceScene } from "./scenes/RaceScene.js";

const config = {
    // 1. Renderer Type: AUTO will choose WebGL if available, otherwise Canvas.
    type: Phaser.AUTO,

    // 2. Game Dimensions: Set to the full browser window size.
    width: window.innerWidth,
    height: window.innerHeight,

    // 3. Physics System: Use 'arcade' physics (simple AABB), with no gravity since it's top-down.
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },

    // 4. Scenes: List of scenes to load. RaceScene is the main gameplay scene.
    scene: [RaceScene]
};

new Phaser.Game(config);
