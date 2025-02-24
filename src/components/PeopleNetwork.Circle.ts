import {
  Application,
  Circle,
  Container,
  FederatedPointerEvent,
  Graphics,
  PointData,
  Text,
  TextStyle,
} from "pixi.js";
import { IScalable, ITransformable } from "../animations";
import { setCanvasPointerStyle } from "../dom";
import Color from "../lib/colors";
import { REF_RADIUS } from "./PeopleNetwork.util";
import { approxTo, lerp3 } from "../util";
import { IDestroyable } from "../interfaces";

export class PNCircle<T> implements IScalable, ITransformable, IDestroyable {
  protected nodeContainer = new Container();

  protected circle = new Graphics();

  protected textStyle: TextStyle;
  protected text;

  protected hovered = false;
  protected drag = {
    isDragging: false,
    data: null as any,
    offset: { x: 0, y: 0 },
  };
  protected offsets = {
    scale: 0,
  };

  protected transformed = false;

  private _setDefaults() {
    this.settings.hoverScale ||= 1.8;
    this.settings.textVisibleRadiusThresh ||= 40;
    this.settings.textStyle ||= {
      fill: Color.fromHex(this.color).contrast > 50 ? "#343434" : "#ededed",
      fontFamily: "Arial",
      fontSize: 18,
      wordWrap: true,
      lineHeight: 18,
      wordWrapWidth: this.radius * 2,
      align: "center",
    };
    this.settings.textStyle.fontSize ||= 18;
    this.settings.textStyle.lineHeight ||= this.settings.textStyle.fontSize;
  }

  constructor(
    private app: Application,
    public position: PointData,
    public radius: number,
    public color: string,
    public label: string,
    protected onPositionChange: (x: number, y: number) => void,
    public context: T, // Extra data to reference
    protected settings: {
      hoverScale?: number;
      textVisibleRadiusThresh?: number; // 30
      textStyle?: Partial<TextStyle>;
    } = {}
  ) {
    // Set defaults
    this._setDefaults();

    // Set text style
    this.textStyle = new TextStyle(this.settings.textStyle);

    // Create Text
    this.text = new Text({
      text: this.label,
      style: this.textStyle,
    });
    this.text.resolution = 2; // For better quality, Retina displays
    this.text.anchor.set(0.5, 0.5); // To center the text
  }

  private onDragStart(event: FederatedPointerEvent) {
    this.drag.isDragging = true;
    this.drag.data = event.data;
    // Calculate offset between the pointer and the current position
    const pos = event.data.getLocalPosition(this.nodeContainer.parent);
    this.drag.offset = {
      x: pos.x - this.position.x,
      y: pos.y - this.position.y,
    };
  }

  private onDragMove() {
    if (this.drag.isDragging && this.drag.data) {
      const pos = this.drag.data.getLocalPosition(this.nodeContainer.parent);
      // Move to the new position minus the offset so the drag feels natural
      this.moveTo({
        x: pos.x - Math.min(this.drag.offset.x, this.radius),
        y: pos.y - Math.min(this.drag.offset.y, this.radius),
      });
      this.onPositionChange(this.position.x, this.position.y);
    }
  }

  private onDragEnd() {
    this.drag.isDragging = false;
    this.drag.data = null;
  }

  parentTo(container: Container) {
    this.nodeContainer.interactive = true;

    this.nodeContainer.on("pointerover", () => {
      this.hovered = true;
      setCanvasPointerStyle(this.app.renderer.canvas, "pointer");
    });

    this.nodeContainer.on("pointerout", () => {
      this.hovered = false;
      setCanvasPointerStyle(this.app.renderer.canvas, "default");
    });

    this.nodeContainer
      .on("pointerdown", this.onDragStart.bind(this))
      .on("pointerup", this.onDragEnd.bind(this))
      .on("pointerupoutside", this.onDragEnd.bind(this))
      .on("pointermove", this.onDragMove.bind(this));

    this.nodeContainer.addChild(this.circle);
    this.nodeContainer.addChild(this.text);

    container.addChild(this.nodeContainer);
  }

  update() {
    this.offsets.scale = approxTo(
      lerp3(
        this.offsets.scale,
        this.hovered ? this.settings.hoverScale! : 1,
        0.1
      ),
      this.hovered ? this.settings.hoverScale! : 1,
      0.1
    );
    const radius = this.radius * this.offsets.scale;

    if (this.transformed) {
      // Update text
      this.text.y = this.position.y;
      this.text.x = this.position.x;
      if (radius > this.settings.textVisibleRadiusThresh!) {
        const { fontSize, lineHeight } = this.settings.textStyle!;
        this.text.style.fontSize = fontSize! * (radius / REF_RADIUS);
        this.text.style.lineHeight = lineHeight! * (radius / REF_RADIUS);
        this.text.style.wordWrapWidth = radius * 2;
      } else {
        this.text.style.fontSize = 0;
      }

      // Update circle
      this.circle.clear();
      this.circle.hitArea = new Circle(
        this.position.x,
        this.position.y,
        radius
      );
      this.circle
        .circle(this.position.x, this.position.y, radius)
        .fill(this.color);
      this.transformed = false;
    }
  }

  /* IScalable Interface */
  getScale() {
    return this.radius;
  }

  scaleTo(scale: number) {
    this.transformed = true;
    this.radius = scale;
  }

  /* ITransformable Interface */
  getPosition() {
    return { x: this.position.x, y: this.position.y };
  }

  getRotation() {
    return 0;
  }

  delta({ x, y }: PointData) {
    this.transformed = true;
    this.position.x += x;
    this.position.y += y;
  }

  // @ts-ignore
  deltaRotation(rotation: number) {}

  moveTo({ x, y }: PointData) {
    this.transformed = true;
    this.position.x = x;
    this.position.y = y;
  }

  // @ts-ignore
  rotateTo(rotation: number) {}

  /* IDestroyable Interface */
  destroy(): void {
    this.circle.destroy();
    this.text.destroy();
    this.nodeContainer.destroy();

    this.circle = null as any;
    this.text = null as any;
    this.nodeContainer = null as any;
  }
}
