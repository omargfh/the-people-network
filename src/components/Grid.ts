import {
  Application,
  Container,
  FillGradient,
  Graphics,
  PointData,
} from "pixi.js";
import { IDestroyable } from "../interfaces";

export class Grid implements IDestroyable {
  gridContainer = new Container();
  constructor(
    private app: Application,
    protected settings: {
      bgColors?: { color: string; offset: number }[];
      gridColors?: {
        horizontal: string;
        vertical: string;
        circle: string;
      };
      gridSpacing?: number;
      include?: Partial<{
        circles: boolean;
        lines: boolean;
        backdrop: boolean;
      }>;
    } = {}
  ) {
    this.settings.bgColors ||= [
      { color: "#111111", offset: 0 },
      { color: "#111111", offset: 0.3 },
      { color: "#F3C623", offset: 1 },
    ];

    this.settings.gridColors ||= {
      horizontal: "#444444",
      vertical: "#333333",
      circle: "#555555",
    };

    this.settings.gridSpacing ||= 35;

    this.settings.include ||= {} as any;
    this.settings.include!.circles ??= true;
    this.settings.include!.lines ??= true;
    this.settings.include!.backdrop ??= true;
  }

  parentTo(container: Container) {
    container.addChild(this.gridContainer);
  }

  draw() {
    const { app, settings } = this;
    const { bgColors, gridColors, gridSpacing, include } = settings;

    if (include!.backdrop) {
      const bg = new Graphics()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill(
          new FillGradient({
            type: "linear",
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
            colorStops: bgColors,
            textureSpace: "local",
          })
        );
      this.gridContainer.addChild(bg);
    }

    if (include!.lines) {
      for (let i = 0; i < app.screen.width / gridSpacing!; i++) {
        this._drawLine({ x: i * gridSpacing!, y: 0 }, { orient: "h" });
        for (let j = 0; j < app.screen.height / gridSpacing!; j++) {
          this._drawLine({ x: 0, y: j * gridSpacing! }, { orient: "v" });
        }
      }
    }

    if (include!.circles) {
      for (let i = 0; i < app.screen.width / gridSpacing!; i++) {
        for (let j = 0; j < app.screen.height / gridSpacing!; j++) {
          this._drawCircle({ x: i * gridSpacing!, y: j * gridSpacing! });
        }
      }
    }
  }

  _drawLine(
    origin: PointData,
    {
      orient,
    }: {
      orient: "h" | "v";
    }
  ) {
    const { app, settings } = this;
    const { gridColors } = settings;

    const line = new Graphics();
    line.position.set(origin.x, origin.y);
    line[orient === "h" ? "lineTo" : "lineTo"](
      0,
      orient === "h" ? app.screen.height : app.screen.width
    );
    line.stroke({
      color: orient === "h" ? gridColors!.horizontal : gridColors!.vertical,
      width: 1,
    });
    this.gridContainer.addChild(line);
  }

  _drawCircle(origin: PointData) {
    const { settings } = this;
    const { gridColors, gridSpacing } = settings;

    const circle = new Graphics();
    circle.position.set(origin.x, origin.y);
    circle.circle(0, 0, gridSpacing! / 15);
    circle.fill(gridColors!.circle);
    this.gridContainer.addChild(circle);
  }

  destroy() {
    this.gridContainer.destroy({ children: true });
  }
}
