/*
Pseudo‑code overview of TrackProgress.js:
1. Initialize with scene, trackMask, and grid settings.
2. performInitialScan(): Loop through the entire world grid. checking if each cell is on the road.
3. Store the total count of drivable cells.
4. update(x, y): Check the cell under the car. If it's a road cell and new, mark it visited.
5. getPercentage(): Return covered / total ratio.
*/
import { SETTINGS } from "../config/settings.js";

export class TrackProgress {
    constructor(trackMask) {
        this.trackMask = trackMask;
        this.gridSize = SETTINGS.GRID_SIZE;

        // Use a Set to store unique keys for visited cells "x,y"
        this.visitedCells = new Set();
        this.totalRoadCells = 0;

        // Perform the heavy calculation once at startup
        this.performInitialScan();
    }

    performInitialScan() {
        // We will scan the center of each grid cell
        const cols = Math.ceil(SETTINGS.WORLD_WIDTH / this.gridSize);
        const rows = Math.ceil(SETTINGS.WORLD_HEIGHT / this.gridSize);

        let roadCount = 0;

        for (let ix = 0; ix < cols; ix++) {
            for (let iy = 0; iy < rows; iy++) {
                // Calculate world position of this cell's center
                const wx = (ix * this.gridSize) + (this.gridSize / 2);
                const wy = (iy * this.gridSize) + (this.gridSize / 2);

                // Check if this point is on the track
                if (this.trackMask.isPixelOnTrack(wx, wy)) {
                    roadCount++;
                    // Ideally, we could store valid cells in a specific structure if we wanted 
                    // to prevent cheating (driving offroad doesn't count), 
                    // but for now we just need the total count.
                }
            }
        }

        this.totalRoadCells = roadCount;
        // console.log(`Track Progress System Init: Found ${this.totalRoadCells} drivable grid cells.`);
    }

    update(carX, carY) {
        // Determine which grid cell the car is currently in
        const gx = Math.floor(carX / this.gridSize);
        const gy = Math.floor(carY / this.gridSize);

        const cellKey = `${gx},${gy}`;

        // Optimization: If we already visited this, do nothing
        if (this.visitedCells.has(cellKey)) return false;

        // Validation: Is this actually a road cell? 
        // We re-check to ensure we don't count off-road driving if the user glitches out.
        const wx = (gx * this.gridSize) + (this.gridSize / 2);
        const wy = (gy * this.gridSize) + (this.gridSize / 2);

        if (this.trackMask.isPixelOnTrack(wx, wy)) {
            this.visitedCells.add(cellKey);
            return true; // We made progress!
        }

        return false;
    }

    getProgressRatio() {
        if (this.totalRoadCells === 0) return 0;
        return this.visitedCells.size / this.totalRoadCells;
    }

    getPercentageString() {
        const ratio = this.getProgressRatio();
        return Math.floor(ratio * 100) + "%";
    }

    isComplete() {
        // Give a tiny buffer (99.5% rounds to 100%) or strict 100%
        return this.visitedCells.size >= this.totalRoadCells;
    }
}
