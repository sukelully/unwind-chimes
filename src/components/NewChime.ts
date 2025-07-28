import { type Drawable, type Position, type Colorable } from '../types.ts';

export class DrawableRect implements Drawable, Position, Colorable {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string;

  constructor(x: number, y: number, width: number, height: number, color: string = 'blue') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(): void {
    // Animation or position updates
    this.x += 1;
    if (this.x > 800) this.x = -this.width;
  }

  contains(mouseX: number, mouseY: number): boolean {
    return (
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.height
    );
  }

  // Additional methods specific to rectangles
  getArea(): number {
    return this.width * this.height;
  }

  getBounds(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }

  // Set position
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  // Set size
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
