/*
Pseudo‑code overview of TrackMask.js:
1. Import SETTINGS for car dimensions.
2. Export TrackMask class that creates an off‑screen canvas from the track texture.
3. Provides isPixelOnTrack(x, y) to check if a pixel is part of the drivable area.
4. Provides isCarSafe(x, y, rotation) to verify all four car corners stay on track.
*/
import { SETTINGS } from "../config/settings.js";

export class TrackMask {
    constructor(scene, textureKey) {
        // 1. Get the source image from Phaser's texture manager.
        const img = scene.textures.get(textureKey).getSourceImage();

        // 2. Create an off-screen HTML Canvas (not visible to user).
        this.canvas = document.createElement('canvas');
        this.canvas.width = img.width;
        this.canvas.height = img.height;

        // 3. Draw the track image onto this canvas so we can read its pixel data.
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.ctx.drawImage(img, 0, 0);

        // 4. Optimization: Read ALL pixel data once!
        // This prevents thousands of WebGL/GPU sync calls per frame or startup.
        this.pixelData = this.ctx.getImageData(0, 0, img.width, img.height).data;
    }

    isPixelOnTrack(x, y) {
        // CORRECTION: You deleted the definitions of 'ix' and 'iy'!
        // We need these to convert world coordinates (floats) to grid coordinates (integers).
        const ix = Math.floor(x);
        const iy = Math.floor(y);

        // Safety Check: Use these checks to prevent errors if the car goes outside the map.
        if (
            ix < 0 || iy < 0 ||
            ix >= this.canvas.width ||
            iy >= this.canvas.height
        ) return false;

        const index = (iy * this.canvas.width + ix) * 4;

        // Check Alpha channel (Transparency)
        // > 0 means it has some color (Road)
        // 0 means it is fully transparent (Wall)
        const a = this.pixelData[index + 3];
        return a > 0;
    }

    isCarSafe(x, y, rotation) {
        // 1. Setup dimensions and rotation math
        const w = SETTINGS.CAR_WIDTH;
        const h = SETTINGS.CAR_HEIGHT;

        const hw = w / 2;
        const hh = h / 2;

        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // 2. Define the relative offsets for each of the 4 corners of the car.
        const corners = [
            { dx: hw, dy: hh },
            { dx: hw, dy: -hh },
            { dx: -hw, dy: hh },
            { dx: -hw, dy: -hh }
        ];

        // 3. Iterate through all corners
        for (const c of corners) {
            // Rotate the offset and apply to the car's current world position.
            const rx = (c.dx * cos) - (c.dy * sin);
            const ry = (c.dx * sin) + (c.dy * cos);

            // 4. If ANY corner is off-road, the car position is invalid.
            if (!this.isPixelOnTrack(x + rx, y + ry)) {
                return false;
            }
        }
        // 5. If loop completes, all corners are safe.
        return true;
    }
}
