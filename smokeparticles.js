class smokeParticle {
  // Constructor to initialize the smoke particle
  constructor(x, y) {
    this.x = x; // The x-coordinate of the particle
    this.y = y; // The y-coordinate of the particle
    this.alpha = 255; // Start with full opacity (fully visible)
  }

  // Method to update the particle's position and fade out over time
  update() {
    this.y -= random(0.5, 1); // Move the particle upwards by a small random amount
    this.x += random(-0.5, 0.5); // Slight drift left or right
    this.alpha -= 5; // Gradually reduce the opacity to create the fade-out effect
  }

  // Method to display the particle on the canvas
  display() {
    fill(255, this.alpha); // Set the fill color to white with the current opacity (alpha)
    rect(this.x * cellSize, this.y * cellSize, cellSize / 2); // Draw a small rectangle at the particle's position
  }

  // Method to check if the particle has completely faded out
  isGone() {
    return this.alpha <= 0; // Returns true when the particle is fully transparent
  }
}
