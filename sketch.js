// Initialize global variables
let cols; // Number of columns in the grid
let rows; // Number of rows in the grid
let grid; // 2D array representing the grid for the simulation
let colorGrid; // 2D array to store color information for each cell in the grid
let fireFrameCounter = 0; // Counter for managing the fire simulation
let smokeParticles = []; // Array to store smoke particles
let homepage = true; // Flag to control the homepage screen
let start, restart, gBtn, fBtn, wBtn, sBtn; // UI elements (buttons)
let selectedElement = null; // The element currently selected by the user

const cellSize = 8; // Size of each cell in the grid
// Constants representing the different elements in the simulation
const EMPTY = 0;
const SAND = 1;
const WATER = 2;
const FIRE = 3;
const GRASS = 4;
const LEAVES = 5;
const GLASS = 6;
const WET_SAND = 7;

// Function to generate random colors for sand
function randomSandColor() {
  let colours = ["#F2D0A9", "#EEC88F", "#E1BC6D", "#FDD7B4"];
  return random(colours); // Returns a random color for sand
}

// Preload images and UI elements
function preload() {
  // Get references to the UI elements by their IDs
  start = document.getElementById("start"); // Start button
  restart = document.getElementById("restart"); // Restart button
  gBtn = document.getElementById("grass"); // Grass button
  fBtn = document.getElementById("fire"); // Fire button
  wBtn = document.getElementById("water"); // Water button
  sBtn = document.getElementById("sand"); // Sand button
}

// Setup function runs once to initialize the grid and canvas
function setup() {
  cols = floor(windowWidth / cellSize); // Calculate number of columns based on window width
  rows = floor((windowHeight - 130) / cellSize); // Calculate number of rows based on window height
  createCanvas(cols * cellSize, windowHeight); // Create the canvas with the calculated width and height
  colorGrid = Array(cols).fill().map(() => Array(rows).fill(null)); // Initialize the colorGrid with null values
  grid = Array(cols).fill().map(() => Array(rows).fill(EMPTY)); // Initialize the grid with EMPTY cells
  noStroke(); // Disable stroke for drawing shapes

  // Position UI elements based on canvas size
  start.style.left = width / 2 - 100 + "px";
  sBtn.style.left = width / 6 + "px";
  gBtn.style.left = width / 3 + "px";
  fBtn.style.left = width / 2 + "px";
  wBtn.style.left = (2 * width) / 3 + "px";
  restart.style.left = width / 2 - 100 + "px";
}

// Draw function runs continuously to update the simulation
function draw() {
  if (homepage) {
    // Display the start screen with instructions and simulation info
    textWrap(WORD);
    background("#778DA9"); // Background color
    fill("#5E503F");
    textFont("Jersey 20 Charted");
    textSize(52);
    textAlign(CENTER);
    text("Falling Elements Simulator", 0, 25, width);
    fill("#E1E0DD");
    textFont("Roboto");
    textSize(24);

    // Instructions for using the simulator
    text(
      `You may have heard about the falling sand simulator, where you simulate, well, falling sand. This simulation is just that, but with a twist! There's more than just sand now. In this enhanced version, you can interact with various materials like water, fire, grass, leaves, and glass, each with its own unique behaviour and reactions. \n\n Instructions: \nIn this simulation, you can control the elements, placing them in the grid and watching how they interact with each other in real-time. Press your desired element and hold the left-click of your mouse button down to deploy the element. You can press restart anytime you want to restart the simulation. Press start to begin the simulation.`,
      15,
      100,
      width - 25
    );
  } else if (!homepage) {
    // Main simulation screen
    background(0); // Black background
    fill("#778DA9");
    rect(0, rows * cellSize, width, height - rows * cellSize); // Draw bottom UI area
    displayGrid(); // Function to draw the grid with elements
    simulateFalling(); // Simulate falling elements like sand, water, etc.
    simulateWetSand(); // Simulate wet sand behavior
    simulateWater(); // Simulate water behavior
    simulateFire(); // Simulate fire behavior
    simulateGrass(); // Simulate grass behavior
    simulateGlass(); // Simulate glass behavior
    handleMouseInput(); // Handle user input (placing elements with the mouse)
    updateSmokeParticles(); // Update smoke particles
    drawSmokeParticles(); // Draw smoke particles on the canvas
    fireFrameCounter++; // Increment fire simulation frame counter
  }
}

// Function to display the grid with elements
function displayGrid() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let colorValue = color(0); // Default color
      // Set color based on the element in the grid
      if (grid[x][y] === SAND && colorGrid[x][y]) colorValue = colorGrid[x][y];
      if (grid[x][y] === WATER) colorValue = "#4DA6FF";
      if (grid[x][y] === FIRE) colorValue = "#FF4500";
      if (grid[x][y] === GRASS) colorValue = "#228B22";
      if (grid[x][y] === LEAVES) colorValue = "#2E8B57";
      if (grid[x][y] === GLASS) colorValue = color(255, 240);
      if (grid[x][y] === WET_SAND) colorValue = "#C2A769";
      
      // Draw the colored cell on the grid
      fill(colorValue);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

// Function to handle mouse input for placing elements in the grid
function handleMouseInput() {
  if (mouseIsPressed && selectedElement !== null && mouseY < rows * cellSize) {
    let x = floor(mouseX / cellSize); // Get the x-coordinate of the grid
    let y = floor(mouseY / cellSize); // Get the y-coordinate of the grid
    let numGrains = floor(random(5, 15)); // Random number of elements to place
    for (let i = 0; i < numGrains; i++) {
      let offsetX = floor(random(-3, 3)); // Random offset for x-coordinate
      let offsetY = floor(random(-3, 3)); // Random offset for y-coordinate
      let newX = constrain(x + offsetX, 0, cols - 1); // Constrain x-coordinate within grid bounds
      let newY = constrain(y + offsetY, 0, rows - 1); // Constrain y-coordinate within grid bounds
      if (grid[newX][newY] === EMPTY) { // If the cell is empty, place the selected element
        grid[newX][newY] = selectedElement;
        if (selectedElement === SAND) {
          colorGrid[newX][newY] = randomSandColor(); // Assign a random color to sand
        }
      }
    }
  }
}

// Function to update smoke particles (used in the fire simulation)
function updateSmokeParticles() {
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    smokeParticles[i].update(); // Update the position of the particle
    if (smokeParticles[i].isGone()) {
      smokeParticles.splice(i, 1); // Remove particle if it's gone
    }
  }
}

// Function to draw smoke particles on the canvas
function drawSmokeParticles() {
  for (let particle of smokeParticles) {
    particle.display(); // Display each smoke particle
  }
}

// Function to select an element (called when the user clicks an element button)
function selectElement(elementType) {
  selectedElement = elementType; // Set the selected element
}

// Function to restart the simulation by clearing the grid
function restartSketch() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      grid[x][y] = EMPTY; // Clear all cells in the grid
    }
  }
}

// Function to start the simulation by hiding the homepage and showing the simulation
function startSim() {
  homepage = false; // Hide start screen
  start.style.display = "none"; // Hide the start button
  restart.style.display = "inline-block"; // Show the restart button
  gBtn.style.display = "inline-block"; // Show the grass button
  wBtn.style.display = "inline-block"; // Show the water button
  fBtn.style.display = "inline-block"; // Show the fire button
  sBtn.style.display = "inline-block"; // Show the sand button
}
