/*
Pseudo‑code overview of Car.js:
1. Import SETTINGS configuration.
2. Define createCar(scene, x, y) to build car graphics.
3. Generate a texture for the car.
4. Create a physics-enabled sprite with appropriate size and offset.
5. Apply physics tweaks (origin, collides, drag) and return the car.
*/
import { SETTINGS } from "../config/settings.js";

export function createCar(scene, x, y) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    const w = SETTINGS.CAR_WIDTH;
    const h = SETTINGS.CAR_HEIGHT;

    // --- 1. Draw Car Body ---
    // Use the Graphics API to draw a rounded rectangle for the chassis.
    g.fillStyle(0x222222, 1);
    g.fillRoundedRect(0, 0, w, h, 6);

    // --- 2. Draw Details (Hood, Windshield, Wheels) ---
    // Hood
    g.fillStyle(0xaa0000, 1);
    g.fillRoundedRect(4, 2, w - 8, h - 4, 4);

    // Windshield
    g.fillStyle(0x66ccff, 0.9);
    g.fillRoundedRect(w * 0.45, 4, w * 0.35, h - 8, 3);

    // Wheels (4 small rectangles)
    g.fillStyle(0x000000, 1);
    g.fillRect(6, -3, 10, 6);
    g.fillRect(6, h - 3, 10, 6);
    g.fillRect(w - 16, -3, 10, 6);
    g.fillRect(w - 16, h - 3, 10, 6);

    // --- Direction Arrow ---
    g.fillStyle(0xffffff, 0.8);
    g.fillTriangle(
        w - 6, h / 2,
        w - 14, h / 2 - 4,
        w - 14, h / 2 + 4
    );

    // --- 3. Generate Texture ---
    // Bake the graphics into a 'carTexture' so we can use it as a Sprite.
    g.generateTexture('carTexture', w, h);

    // --- 4. Create Physics Sprite ---
    // Add the sprite to the physics world at the spawn position.
    const car = scene.physics.add.sprite(x, y, 'carTexture');

    // IMPORTANT physics tweaks
    // --- 5. Physics Configuration ---
    // Set origin to center for proper rotation.
    car.setOrigin(0.5);
    // Shrink the hitbox slightly to avoid getting stuck on walls.
    car.body.setSize(w - 6, h - 6);
    car.body.setOffset(3, 3);

    // Enable collision with world bounds (edges of map).
    car.setCollideWorldBounds(true);
    // Disable default arcade physics drag (we handle it manually).
    car.setDrag(0);

    return car;
}
