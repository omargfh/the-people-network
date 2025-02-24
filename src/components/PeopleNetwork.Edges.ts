import { Application, Container, Graphics, PointData } from "pixi.js";
import { PNLineStyle } from "./PeopleNetwork.util";
import { IDestroyable } from "../interfaces";
import { lerp3, USED } from "../util";

export class PNEdges<T> implements IDestroyable {
  protected graphics = new Graphics();

  constructor(
    private app: Application,
    public positionA: PointData,
    public positionB: PointData,
    public color: string,
    public lineStyle: PNLineStyle,
    public labelTop: string,
    public labelBottom: string,
    public width: number,
    public context: T // Extra data to reference
  ) {
    USED(this.app);
  }

  parentTo(container: Container) {
    container.addChild(this.graphics);
    this.graphics.alpha = -3.0;
  }

  update() {
    this.graphics.clear();
    this.graphics.alpha = lerp3(this.graphics.alpha, 1, 0.05);
    this.graphics.position.set(this.positionA.x, this.positionA.y);
    this.graphics
      .lineTo(
        this.positionB.x - this.positionA.x,
        this.positionB.y - this.positionA.y
      )
      .stroke({
        color: this.color,
        width: this.width,
      });
  }

  destroy() {
    this.graphics.destroy();
  }
}
