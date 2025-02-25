import { Application, Container, Graphics, PointData } from "pixi.js";
import { PNLineStyle } from "./PeopleNetwork.types";
import { IDestroyable } from "../interfaces";
import { crossScreen, inScreen, lerp3, USED } from "../util";

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
    public context: T, // Extra data to reference
    public settings: {
      screenSpaceScale?: { value: number }; // Reference to a value carried by the parent
    }
  ) {
    this._setDefaults();
    USED(this.app);
  }

  parentTo(container: Container) {
    container.addChild(this.graphics);
    this.graphics.alpha = -3.0;
  }

  update() {
    if (this._cullScreenSpace()) {
      this.graphics.alpha = 0;
      return;
    } else {
      this.graphics.alpha = 1;
    }

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

  bindPositions(positionA: PointData, positionB: PointData) {
    this.positionA = positionA;
    this.positionB = positionB;
  }

  destroy() {
    this.graphics.destroy();
  }

  /* Private Methods */
  private _setDefaults() {
    this.settings.screenSpaceScale ||= { value: 1 };
  }
  private _cullScreenSpace() {
    // This is cheaper than using the built-in PIXI.js method
    // because we only cull if neither nodes are in the screen
    //instead of checking if the line is in the screen

    // TODO: Wonder if drawing the edge is cheaper than checking if
    // it's in the screen
    const ssScale = (1 + 0.25) * this.settings.screenSpaceScale?.value!;
    return (
      !inScreen(this.positionA, this.app, undefined, ssScale) &&
      !inScreen(this.positionB, this.app, undefined, ssScale) &&
      !crossScreen(this.positionA, this.positionB, this.app, ssScale)
    );
  }
}
