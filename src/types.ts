export interface WeatherData {
  datetime: string;
  windspeed: number;
  winddir: number;
  conditions: string;
}

export interface Drawable {
  draw(ctx: CanvasRenderingContext2D): void;
  update(canvasWidth?: number, canvasHeight?: number): void;
  contains(mouseX: number, mouseY: number): boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Colorable {
  color: string;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}