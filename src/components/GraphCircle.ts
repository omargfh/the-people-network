import { Application, Circle, Graphics, PointData } from "pixi.js";

export default class GraphCircle {
  protected circlePrimitive: Circle;
  protected graphics: Graphics;

  // For fun
  private _dir = [1, 1];

  // We store state as a circle primitive
  // and draw it using the graphics object
  // from pixi.js
  constructor(
    private app: Application,
    position: PointData,
    radius: number,
    public color: string
  ) {
    this.circlePrimitive = new Circle(position.x, position.y, radius);
    this.graphics = new Graphics();
  }

  // Simple draw method for first time rendering
  draw = () => {
    const { x, y, radius } = this.circlePrimitive;
    this.graphics.circle(x, y, radius).fill(this.color);
    this.app.stage.addChild(this.graphics);
  };

  // Simple update method for animating the circle
  tick = () => {
    this.graphics.clear();
    this._collideAtScreenEdges(10);
    this.draw();
  };

  _collideAtScreenEdges(speed: number = 3) {
    const halfRadius = this.circlePrimitive.radius / 2;

    const nextXPos = this.circlePrimitive.x + speed * this._dir[0];
    const nextYPos = this.circlePrimitive.y + speed * this._dir[1];

    if (nextXPos > this.app.screen.width - halfRadius) {
      this._dir[0] = -1;
    }
    if (nextXPos < halfRadius) {
      this._dir[0] = 1;
    }
    if (nextYPos > this.app.screen.height - halfRadius) {
      this._dir[1] = -1;
    }
    if (nextYPos < halfRadius) {
      this._dir[1] = 1;
    }

    this.circlePrimitive.x += speed * this._dir[0];
    this.circlePrimitive.y += speed * this._dir[1];
  }
}
