/*
Pseudo‑code overview of RaceScene.js:
1. Import SETTINGS, createCar, controls utilities, and TrackMask.
2. Define RaceScene class extending Phaser.Scene.
3. Preload background image.
4. Create world bounds, track mask, car, camera, and input controls.
5. Handle click to start the game.
6. In update, process input, apply physics, enforce track safety, and add visual weight‑transfer effects.
*/
import { SETTINGS } from "../config/settings.js";
import { createCar } from "../entities/Car.js";
import { createControls, readControls } from "../input/Controls.js";
import { TrackMask } from "../systems/TrackMask.js";
import { TrackProgress } from "../systems/TrackProgress.js";
import { CURRENT_MAP } from "../config/MapConfig.js";

export class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
        this.currentSpeed = 0;
        this.gameFocused = false;

        // Win Condition Flags
        this.hasTriggeredStart = false;

        // Timer
        this.timeLeft = CURRENT_MAP.timeLimit;
        this.isGameOver = false;
    }

    preload() {
        this.load.image('background', 'assets/race_ground.png');
        this.load.image('trackmask', 'assets/track_mask.png');
    }

    create() {
        // 1. Setup World & Background
        this.add.image(0, 0, 'background').setOrigin(0);
        // this.add.image(0, 0, 'start_race_place').setOrigin(0);
        this.physics.world.setBounds(0, 0, SETTINGS.WORLD_WIDTH, SETTINGS.WORLD_HEIGHT);

        // 2. Initialize Track Mask (Collision System)
        this.trackMask = new TrackMask(this, 'trackmask');

        // 2b. Initialize Progression System
        this.trackProgress = new TrackProgress(this.trackMask);

        // 3. Create Player Car
        this.car = createCar(this, CURRENT_MAP.spawnX, CURRENT_MAP.spawnY);

        // --- ZONES SETUP ---
        // 3a. Start Zone (Visible Green Rectangle)
        // Indicates where the race begins.
        this.startZone = this.add.rectangle(CURRENT_MAP.spawnX, CURRENT_MAP.spawnY, 300, 300, 0x00ff00, 0.3);
        this.startZone.setVisible(CURRENT_MAP.showZones); // Set visibility based on config
        this.physics.add.existing(this.startZone, true); // Static body

        // 3b. End Zone (Visible Red Rectangle for Debugging)
        // Co-located with Start Zone to require a full lap (or coverage loop).
        this.endZone = this.add.rectangle(CURRENT_MAP.spawnX, CURRENT_MAP.spawnY, 300, 300, 0xff0000, 0.3);
        this.endZone.setVisible(CURRENT_MAP.showZones); // Set visibility based on config
        this.physics.add.existing(this.endZone, true);

        // 4. Setup Camera to follow car
        this.cameras.main.setBounds(0, 0, SETTINGS.WORLD_WIDTH, SETTINGS.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.car, true, 0.1, 0.1);

        // 5. Setup Input
        this.controls = createControls(this);

        // 6. UI: Click to Start Overlay
        // Limit scroll factor so UI stays on screen
        this.debugText = this.add.text(400, 300, 'CLICK TO START', {
            font: '32px Arial',
            fill: '#fff',
            backgroundColor: '#ff0000',
            padding: { x: 20, y: 10 }
        }).setScrollFactor(0).setOrigin(0.5);

        // Progress UI
        const initialText = CURRENT_MAP.showCoverage ? 'Covered: 0%' : '';
        this.progressText = this.add.text(10, 10, initialText, {
            font: '24px monospace',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0); // Visible by default for debugging

        // Win Message
        this.winText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'YOU WIN!', {
            font: 'bold 72px Arial',
            fill: '#00ff00', // green color
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setScrollFactor(0).setOrigin(0.5).setVisible(false).setDepth(100);

        // Game End Overlay (Background)
        this.overlay = this.add.rectangle(0, 0, window.innerWidth, window.innerHeight, 0x000000, 1)
            .setOrigin(0)
            .setScrollFactor(0)
            .setVisible(false)
            .setDepth(90); // Below text (100) but above game

        // Timer UI
        this.timerText = this.add.text(window.innerWidth - 250, 10, `Time: ${CURRENT_MAP.timeLimit}`, {
            font: '32px monospace',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setAlpha(0).setDepth(100);

        // Game Over UI
        this.gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'GAME OVER', {
            font: 'bold 72px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setScrollFactor(0).setOrigin(0.5).setVisible(false).setDepth(100);

        // Listener to unlock game controls
        this.input.on('pointerdown', () => {
            if (!this.gameFocused) {
                this.gameFocused = true;
                this.debugText.destroy(); // Remove start text
                this.progressText.setAlpha(1); // Show progress
                this.timerText.setAlpha(1); // Show timer
            }
        });
    }

    update(time, delta) {
        if (!this.gameFocused || this.isGameOver) return;

        const dt = delta / 1000;
        // --- A. Read Inputs ---
        const input = readControls(this.controls);

        // --- B. Steering Logic (Safe Rotation Fix) ---
        // Only steer if moving fast enough (>10 speed)
        if (Math.abs(this.currentSpeed) > 10) {
            let newRotation = this.car.rotation;
            if (input.left) newRotation -= SETTINGS.TURN_SPEED * dt;
            if (input.right) newRotation += SETTINGS.TURN_SPEED * dt;

            // FIX: Only apply rotation if the new angle keeps the car on track!
            if (newRotation !== this.car.rotation) {
                if (this.trackMask.isCarSafe(this.car.x, this.car.y, newRotation)) {
                    this.car.rotation = newRotation;
                } else {
                    // Optional: hit wall sound or particle effect here
                    // Reduce speed slightly on wall scrape to discourage grinding
                    this.currentSpeed *= 0.95;
                }
            }
        }

        // --- C. Acceleration/Braking ---
        if (input.up) this.currentSpeed += SETTINGS.ACCELERATION * dt;
        else if (input.down) this.currentSpeed -= SETTINGS.ACCELERATION * dt;

        // --- Timer Update ---
        if (this.hasTriggeredStart && !this.isGameOver) {
            this.timeLeft -= dt;
            this.timerText.setText(`Time: ${Math.max(0, Math.ceil(this.timeLeft))}`);

            if (this.timeLeft <= 0) {
                this.isGameOver = true;
                this.physics.pause();
                this.overlay.setVisible(true); // Show black background
                this.gameOverText.setVisible(true);
                return; // Stop update
            }
        }

        // --- D. Natural Friction ---
        this.currentSpeed *= SETTINGS.DRAG;

        // --- E. Movement & Collision Checking ---
        // 1. Calculate velocity vector from speed & rotation
        const velocity = new Phaser.Math.Vector2();
        this.physics.velocityFromRotation(
            this.car.rotation,
            this.currentSpeed * dt,
            velocity
        );

        // 2. Try moving X axis first
        const px = this.car.x + velocity.x;
        const py = this.car.y + velocity.y;

        if (this.trackMask.isCarSafe(px, this.car.y, this.car.rotation)) {
            this.car.x = px;
        }

        // 3. Try moving Y axis separately (allows sliding along walls)
        if (this.trackMask.isCarSafe(this.car.x, py, this.car.rotation)) {
            this.car.y = py;
        }
        // --- F. Visual Juice (Squash & Stretch) ---
        // Slight scale deformation based on speed ratio for speed sensation.
        const speedRatio = Phaser.Math.Clamp(
            this.currentSpeed / SETTINGS.MAX_SPEED,
            -1,
            1
        );

        this.car.scaleY = 1 - Math.abs(speedRatio) * 0.05;
        this.car.scaleX = 1 + Math.abs(speedRatio) * 0.03;

        // --- G. Update Progression ---
        const didProgress = this.trackProgress.update(this.car.x, this.car.y);

        // Check for Zones Overlap
        // 1. Start Zone
        if (!this.hasTriggeredStart && this.physics.overlap(this.car, this.startZone)) {
            // console.log("Start Zone Triggered!");
            this.hasTriggeredStart = true;
            this.progressText.setText('Race Started!');
            this.progressText.setTint(0xffff00);

            // Fade out the start zone graphic nicely but keep slight visibility
            this.tweens.add({
                targets: this.startZone,
                alpha: 0.1,
                duration: 1000
            });
        }

        if (didProgress && CURRENT_MAP.showCoverage) {
            this.progressText.setText(`Covered: ${this.trackProgress.getPercentageString()}`);
        }

        // 2. Win Check (End Zone + >10% Coverage)
        if (this.hasTriggeredStart && this.physics.overlap(this.car, this.endZone)) {
            const ratio = this.trackProgress.getProgressRatio();

            // Requirement: > Win Ratio Coverage (Ensures player left start area)
            if (ratio > CURRENT_MAP.winRatio) {
                this.isGameOver = true; // Stop the game loop
                this.overlay.setVisible(true); // Show black background
                this.winText.setVisible(true);
                this.physics.pause();
                this.progressText.setText(`WINNER! (${Math.floor(ratio * 100)}% Coverage)`);
                this.progressText.setTint(0x00ff00);
            }
        }

    }
}
