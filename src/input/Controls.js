/*
Pseudo‑code overview of Controls.js:
1. Export createControls(scene) to set up keyboard input (arrow keys and WASD).
2. Export readControls(ctrl) to read the current state of those inputs and return a simple object with up/down/left/right booleans.
*/
export function createControls(scene) {
    // 1. Create standard cursor keys (Arrows, Space, Shift).
    // 2. Add WASD keys explicitly for alternative control scheme.
    return {
        cursors: scene.input.keyboard.createCursorKeys(),
        keys: scene.input.keyboard.addKeys('W,A,S,D')
    };
}

export function readControls(ctrl) {
    // 1. Check UP (Accelerate)
    // 2. Check DOWN (Brake/Reverse)
    // 3. Check LEFT/RIGHT (Steering)
    // Returns a simple boolean object abstracting the keys used.
    return {
        up: ctrl.cursors.up.isDown || ctrl.keys.W.isDown,
        down: ctrl.cursors.down.isDown || ctrl.keys.S.isDown,
        left: ctrl.cursors.left.isDown || ctrl.keys.A.isDown,
        right: ctrl.cursors.right.isDown || ctrl.keys.D.isDown
    };
}
