import { Clapper } from './Clapper.ts';

export class Chime extends Clapper {
  constructor(x: number, y: number, color: string = 'blue', r: number = 30) {
    super(x, y, color, r);
  }
}
