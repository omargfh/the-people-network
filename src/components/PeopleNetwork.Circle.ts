import {
  Application,
  Circle,
  Container,
  FederatedPointerEvent,
  Graphics,
  PointData,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";
import { IScalable, ITransformable } from "../animations";
import { setCanvasPointerStyle } from "../dom";
import Color from "../lib/colors";
import { REF_RADIUS } from "./PeopleNetwork.types";
import { approxTo, inScreen, lerp3 } from "../util";
import { IDestroyable, IPostionBindable } from "../interfaces";

export class PNCircle<T>
  implements IScalable, ITransformable, IPostionBindable, IDestroyable
{
  // Container
  protected nodeContainer = new Container();

  // Circle
  protected circle = new Graphics();

  // Text
  protected textStyle: TextStyle;
  protected text;

  // Texture
  protected texture: Texture | null | undefined = null;

  // State for interaction
  protected hovered = false;
  protected drag = {
    isDragging: false,
    data: null as any,
    offset: { x: 0, y: 0 },
  };

  // Offsets are centered about 0
  // and are used to animate the object
  // without changing the original values
  protected offsets = {
    scale: 0,
    tint: 0,
  };

  // Track if the object has been transformed
  // to avoid unnecessary updates
  protected transformed = false;

  constructor(
    private app: Application,
    public position: PointData,
    public radius: number,
    public color: string,
    public label: string,
    protected getPicture: (id: string) => Promise<Texture | null>,
    public context: T, // Extra data to reference
    public settings: {
      hoverScale?: number;
      textVisibleRadiusThresh?: number; // 30
      textStyle?: Partial<TextStyle>;
      hoverTint?: number;
      textureTint?: number;
      screenSpaceScale?: { value: number }; // Reference to a value carried by the parent
      events?: {
        onDragStart?: (event: FederatedPointerEvent) => void;
        onDragMove?: () => void;
        onDragEnd?: () => void;
      };
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
    const radius = this._computeRadius();
    if (!this._cullScreenSpace()) return;

    this._lazyLoadTexture();
    const tintColor = this._computeTint();

    if (this.transformed) {
      this._updateCircle(radius, tintColor);
      this._updateText(radius);
      this.transformed = false;
    }
  }

  /* Dragging */
  private onDragStart(event: FederatedPointerEvent) {
    this.drag.isDragging = true;
    this.drag.data = event.data;
    // Calculate offset between the pointer and the current position
    const pos = event.data.getLocalPosition(this.nodeContainer.parent);
    this.drag.offset = {
      x: pos.x - this.position.x,
      y: pos.y - this.position.y,
    };

    this.settings.events?.onDragStart?.(event);
  }

  private onDragMove() {
    if (this.drag.isDragging && this.drag.data) {
      const pos = this.drag.data.getLocalPosition(this.nodeContainer.parent);
      // Move to the new position minus the offset so the drag feels natural
      this.position.x = pos.x - this.drag.offset.x;
      this.position.y = pos.y - this.drag.offset.y;
    }

    this.settings.events?.onDragMove?.();
  }

  private onDragEnd() {
    this.drag.isDragging = false;
    this.drag.data = null;

    this.settings.events?.onDragEnd?.();
  }

  /* Private Methods */
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
    this.settings.hoverTint ||= 0.9;
    this.settings.textureTint ||= 0.5;
    this.settings.screenSpaceScale ||= { value: 1 };
  }

  private _cullScreenSpace() {
    const ssScale = (1 + 0.25) * this.settings.screenSpaceScale?.value!;
    if (
      !inScreen(
        this.position,
        this.app,
        {
          width: this.radius,
          height: this.radius,
        },
        ssScale
      )
    ) {
      this.circle.clear();
      this.nodeContainer.visible = false;
      return false;
    } else {
      this.nodeContainer.visible = true;
    }
    return true;
  }

  private _computeRadius() {
    this.offsets.scale = approxTo(
      lerp3(
        this.offsets.scale,
        this.hovered ? this.settings.hoverScale! : 1,
        0.1
      ),
      this.hovered ? this.settings.hoverScale! : 1,
      0.1
    );
    return this.radius * this.offsets.scale;
  }

  private _computeTint() {
    this.offsets.tint = approxTo(
      lerp3(
        this.offsets.tint,
        this.hovered ? this.settings.hoverTint! : this.settings.textureTint!,
        0.1
      ),
      this.hovered ? this.settings.hoverTint! : this.settings.textureTint!,
      0.1
    );
    // The hex of the grayscale color
    return (
      "#" +
      Math.round(this.offsets.tint * 255)
        .toString(16)
        .repeat(3)
    );
  }

  private _updateText(radius: number) {
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
  }

  private _updateCircle(radius: number, tintColor: string) {
    this.circle.clear();
    this.circle.tint = tintColor;
    this.circle.hitArea = new Circle(this.position.x, this.position.y, radius);
    this.circle
      .circle(this.position.x, this.position.y, radius)
      .fill(this.texture || this.color);
  }

  private async _lazyLoadTexture() {
    if (this.texture === null) {
      this.texture = undefined;
      this.getPicture(this.label).then((texture) => {
        if (texture == null) return;
        this.texture = texture;
        this.circle.tint = 0x555555;
      });
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

  /* IPostionBindable Interface */
  bindPositionReference(position: PointData) {
    this.position = position;
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
