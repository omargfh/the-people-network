import { PointData } from "pixi.js";

export interface IDestroyable {
  destroy(): void;
}

export interface IPostionBindable {
  bindPositionReference(position: PointData): void;
}
