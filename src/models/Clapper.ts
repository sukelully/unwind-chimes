export class Clapper {
  x: number;
  y: number;
  r: number;
  color: string;

  // Physics properties for wind chime effect
  restX: number;                  // Original rest position
  restY: number;
  velocityX: number = 0;
  velocityY: number = 0;
  damping: number = 0.95;         // Resistance to movement (0-1)
  springStrength: number = 0.02;  // How strong the pull back to rest position is
  maxDisplacement: number = 50;   // Maximum distance from rest position

  constructor(x: number, y: number, color: string, r: number) {
    this.restX = x;
    this.restY = y;
    this.x = x;
    this.y = y;
    this.color = color;
    this.r = r;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fill();

    // Subtle line to show the rest position
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(this.restX + this.r, this.restY);
    ctx.lineTo(this.x + this.r, this.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  update(): void {
    // Calculate spring force
    const springForceX = (this.restX - this.x) * this.springStrength;
    const springForceY = (this.restY - this.y) * this.springStrength;

    // Apply spring force and dampening
    this.velocityX += springForceX;
    this.velocityY += springForceY;
    this.velocityX *= this.damping;
    this.velocityY *= this.damping;

    // Pull back to rest position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Limit maximum displacement from rest position
    const distanceFromRest = Math.sqrt(
      Math.pow(this.x - this.restX, 2) + Math.pow(this.y - this.restY, 2)
    );

    if (distanceFromRest > this.maxDisplacement) {
      const angle = Math.atan2(this.y - this.restY, this.x - this.restX);
      this.x = this.restX + Math.cos(angle) * this.maxDisplacement;
      this.y = this.restY + Math.sin(angle) * this.maxDisplacement;
    }
  }

  applyForce(forceX: number = 0, forceY: number = 0): void {
    this.velocityX += forceX;
    this.velocityY += forceY;
  }

  applyMouseForce(mouseX: number, mouseY: number, strength: number = 0.3): void {
    const centerX = this.x + this.r;
    const centerY = this.y + this.r;

    const dirX = mouseX - centerX;
    const dirY = mouseY - centerY;

    // Normalize and apply force
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    if (distance > 0) {
      const normalizedX = dirX / distance;
      const normalizedY = dirY / distance;

      // Apply force proportional to proximity (closer = stronger force)
      const proximityForce = Math.max(0, 100 - distance) / 100;
      this.applyForce(
        normalizedX * strength * proximityForce,
        normalizedY * strength * proximityForce
      );
    }
  }

  // Method to apply a random gentle breeze effect
  applyBreeze(intensity: number = 0.1): void {
    const randomX = (Math.random() - 0.5) * intensity;
    const randomY = (Math.random() - 0.5) * intensity * 0.3; // Less vertical movement
    this.applyForce(randomX, randomY);
  }

  contains(mouseX: number, mouseY: number): boolean {
    return (
      mouseX >= this.x &&
      mouseX <= this.x + this.r * 2 &&
      mouseY >= this.y &&
      mouseY <= this.y + this.r * 2
    );
  }

  setRestPosition(x: number, y: number): void {
    this.restX = x;
    this.restY = y;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  // Adjust physics properties
  setPhysicsProperties(damping?: number, springStrength?: number, maxDisplacement?: number): void {
    if (damping !== undefined) this.damping = Math.max(0, Math.min(1, damping));
    if (springStrength !== undefined) this.springStrength = Math.max(0, springStrength);
    if (maxDisplacement !== undefined) this.maxDisplacement = Math.max(0, maxDisplacement);
  }

  // Get current displacement from rest position
  getDisplacement(): { x: number; y: number; magnitude: number } {
    const x = this.x - this.restX;
    const y = this.y - this.restY;
    const magnitude = Math.sqrt(x * x + y * y);
    return { x, y, magnitude };
  }
}
