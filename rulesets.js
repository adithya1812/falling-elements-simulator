// Simulates the falling behavior of certain elements (SAND, WET_SAND, GRASS, FIRE) in the grid
function simulateFalling() {
  for (let x = 0; x < cols; x++) {
    for (let y = rows - 2; y >= 0; y--) {
      // If the current grid cell is one of the elements that can fall
      if ([SAND, WET_SAND, GRASS, FIRE].includes(grid[x][y])) {
        let newY = y + 1; // The position where the element will fall

        // If the new position is out of bounds, handle fire separately
        if (newY >= rows) {
          if (grid[x][y] === FIRE) {
            grid[x][y] = EMPTY; // Fire disappears when it hits the bottom
          }
          continue;
        }

        // If the position below is empty, move the element there
        if (grid[x][newY] === EMPTY) {
          grid[x][newY] = grid[x][y];
          colorGrid[x][newY] = colorGrid[x][y];
          grid[x][y] = EMPTY;
        }
        // If the element is sand and it hits water, it becomes wet sand
        else if (grid[x][newY] === WATER && grid[x][y] === SAND) {
          grid[x][newY] = WET_SAND;
          grid[x][y] = EMPTY;
        }
        // If the element is water and it hits sand, it becomes wet sand
        else if (grid[x][newY] === SAND && grid[x][y] === WATER) {
          grid[x][newY] = WET_SAND;
          grid[x][y] = EMPTY;
        } else {
          // If there's something blocking the fall, try to move the element sideways
          let side = random([1, -1]);
          if (
            x + side >= 0 &&
            x + side < cols &&
            grid[x + side][newY] === EMPTY
          ) {
            grid[x + side][newY] = grid[x][y];
            colorGrid[x + side][newY] = colorGrid[x][y];
            grid[x][y] = EMPTY;
          }
        }
      }
    }
  }
}

// Simulates the behavior of wet sand
function simulateWetSand() {
  for (let x = 0; x < cols; x++) {
    for (let y = rows - 1; y >= 0; y--) {
      if (grid[x][y] === WET_SAND) {
        let newY = y + 1;

        // If wet sand touches fire, it turns into glass
        if (grid[x][newY] === FIRE) {
          grid[x][newY] = GLASS;
        }

        // Spread wet sand to neighboring sand blocks with a probability
        if (x + 1 < cols && x > 0 && y - 1 > 0 && y + 1 < rows) {
          if (grid[x + 1][y] === SAND && random() < 0.7) {
            grid[x + 1][y] = WET_SAND;
          }
          if (grid[x - 1][y] === SAND && random() < 0.7) {
            grid[x - 1][y] = WET_SAND;
          }
          if (grid[x][y - 1] === SAND && random() < 0.7) {
            grid[x][y - 1] = WET_SAND;
          }
          if (grid[x][y + 1] === SAND && random() < 0.7) {
            grid[x][y + 1] = WET_SAND;
          }
        }
      }
    }
  }
}

// Simulates the behavior of water
function simulateWater() {
  for (let x = 0; x < cols; x++) {
    for (let y = rows - 1; y >= 0; y--) {
      if (grid[x][y] === WATER) {
        let newY = y + 1;

        // If water touches fire, it disappears
        if (grid[x][newY] === FIRE) {
          grid[x][newY] = EMPTY;
        }
        // If water touches sand, it turns into wet sand
        else if (grid[x][newY] === SAND) {
          grid[x][newY] = WET_SAND;
        }
        // If water touches grass, it disappears
        else if (grid[x][newY] === GRASS) {
          grid[x][y] = EMPTY;
        }
        // If the position below is empty, water moves there
        else if (grid[x][newY] === EMPTY) {
          grid[x][newY] = WATER;
          grid[x][y] = EMPTY;
        } else {
          // If something blocks the downward movement, try moving sideways
          let side = random([1, -1]);
          if (x + side >= 0 && x + side < cols && grid[x + side][y] === EMPTY) {
            grid[x + side][y] = WATER;
            grid[x][y] = EMPTY;
          }
        }
        // If water touches wet sand, it evaporates with a chance
        if (y - 1 > 0) {
          if (grid[x][y - 1] === WET_SAND && random() < 0.7) {
            grid[x][y] = EMPTY;
          }
          if (grid[x][y - 1] === FIRE) {
            grid[x][y - 1] = EMPTY;
          }
        }
        // If water touches fire on the sides, it disappears
        if (x + 1 < cols && x > 0) {
          if (grid[x + 1][y] === FIRE) {
            grid[x + 1][y] = EMPTY;
          }
          if (grid[x][y - 1] === FIRE) {
            grid[x - 1][y] = EMPTY;
          }
        }
      }
    }
  }
}

// Simulates the behavior of fire
function simulateFire() {
  if (fireFrameCounter % 6 !== 0) return; // Fire spreads every 6th frame
  for (let x = 0; x < cols; x++) {
    for (let y = rows - 1; y >= 0; y--) {
      if (grid[x][y] === FIRE) {
        let newY = y + 1;
        if (newY >= rows) {
          grid[x][y] = EMPTY;
          continue;
        }
        // If the position below is empty, fire moves there
        if (grid[x][newY] === EMPTY) {
          grid[x][newY] = FIRE;
          grid[x][y] = EMPTY;
        }
        // If fire touches grass, it spreads to it with a chance
        else if (grid[x][newY] === GRASS && random() < 0.7) {
          grid[x][newY] = FIRE;
          grid[x][y] = EMPTY;
        }
        // If fire touches sand, glass, or wet sand, it turns to glass
        else if (
          grid[x][newY] === SAND ||
          grid[x][newY] === GLASS ||
          grid[x][newY] === WET_SAND
        ) {
          grid[x][y] = EMPTY;
          grid[x][newY] = GLASS;
        }
        // If fire touches water, it disappears
        else if (grid[x][newY] === WATER) {
          grid[x][y] = EMPTY;
        }
        // Create smoke particles if fire spreads upwards
        if (y > 0 && grid[x][y - 1] !== FIRE && random() < 0.3) {
          smokeParticles.push(new smokeParticle(x, y - 1));
        }
      }
    }
  }
}

// Simulates the behavior of grass
function simulateGrass() {
  for (let x = 0; x < cols; x++) {
    for (let y = rows - 1; y >= 0; y--) {
      if (grid[x][y] === GRASS) {
        let newY = y + 1;
        if (newY > rows) {
          grid[x][y] = EMPTY;
          continue;
        }
        // If there is fire nearby, grass may catch fire with a chance
        if (
          x + 1 < cols &&
          x > 0 &&
          y + 1 < rows &&
          fireFrameCounter % 6 === 0
        ) {
          if (grid[x + 1][y] === FIRE && random() < 0.7) {
            grid[x][y] = FIRE;
          }
          if (grid[x - 1][y] === FIRE && random() < 0.7) {
            grid[x][y] = FIRE;
          }
          if (grid[x][y + 1] === FIRE && random() < 0.7) {
            grid[x][y] = FIRE;
          }
        }
        // If grass touches water, it turns into grass again
        if (grid[x][newY] === WATER) {
          grid[x][newY] = GRASS;
          if (random() < 0.1) {
            grid[x][y] = GRASS;
          } else {
            grid[x][y] = EMPTY;
          }
        }
        // If grass is adjacent to water, it turns into grass
        else {
          let side = random([1, -1]);
          if (x + side >= 0 && x + side < cols && grid[x + side][y] === WATER) {
            grid[x + side][y] = GRASS;
            if (random() < 0.1) {
              grid[x][y] = GRASS;
            } else {
              grid[x][y] = EMPTY;
            }
          }
        }
      }
    }
  }
}

// Simulates the behavior of glass
function simulateGlass() {
  for (let x = 0; x < cols; x++) {
    for (let y = rows - 1; y >= 0; y--) {
      if (grid[x][y] === SAND || grid[x][y] === WET_SAND) {
        let newY = y + 1;
        if (newY > rows) {
          grid[x][y] = EMPTY;
          continue;
        }
        // If there's glass below, the current position turns into glass
        if (grid[x][y - 1] === GLASS) {
          grid[x][y] = GLASS;
        }
      }
    }
  }
}
