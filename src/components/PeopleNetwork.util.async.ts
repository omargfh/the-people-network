import { Assets, Texture } from "pixi.js";
import { USED } from "../util";

export async function getDummyPicture(id: string): Promise<Texture | null> {
  USED(id);
  try {
    return Assets.load(
      `dummy_images/${Math.random() > 0.5 ? "women" : "men"}/${Math.floor(
        Math.random() * 100
      )}.jpg`
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
