/*
Pseudo‑code overview of settings.js:
1. Export a SETTINGS object containing game constants such as speeds, car dimensions, and world size.
2. These constants are used throughout the game for physics, rendering, and collision logic.
*/
export const SETTINGS = {
    // --- Physics Constants ---
    // MAX_SPEED: The absolute speed limit for the car.
    // ACCELERATION: How fast the car gains speed when pressing gas.
    // DRAG: Friction applied every frame (0.96 means 4% speed loss per frame).
    // TURN_SPEED: How fast the car rotates when steering.
    MAX_SPEED: 12000,
    ACCELERATION: 5000,
    DRAG: 0.96,
    TURN_SPEED: 3.0,

    // --- Car Dimensions ---
    // Used for rendering the car graphics and for collision calculations (corners).
    CAR_WIDTH: 50,
    CAR_HEIGHT: 26,

    // --- World Limits ---
    // Defines the total size of the game world/map in pixels.
    WORLD_WIDTH: 6800,
    WORLD_HEIGHT: 5300,

    // --- Progression System ---
    // Size of the grid cells for tracking coverage (smaller = more precision, more CPU).
    GRID_SIZE: 40
};
