import { Application, Container } from "pixi.js";
import PeopleNetwork from "./PeopleNetwork";
import { PNCircleContext, PNEdgeRef, PNNodeRef } from "./PeopleNetwork.types";
import { clamp } from "../util";
import { setCanvasPointerStyle } from "../dom";
import { PNCircle } from "./PeopleNetwork.Circle";
import { getDummyPicture } from "./PeopleNetwork.util.async";
import { PNEdges } from "./PeopleNetwork.Edges";
import { animateScale } from "../animations";

export default class PeopleNetworkGraphics {
  // Containers
  topLevelContainer = new Container();
  nodesContainer = new Container();
  edgesContainer = new Container();
  parent: Container;

  // Lookup tables
  edges: Record<
    string,
    PNEdges<{
      nodeA: PNNodeRef;
      nodeB: PNNodeRef;
    }>
  > = {};

  public nodes: Record<string, PNCircle<PNCircleContext>> = {};
  public centerNode: PNCircle<PNCircleContext> | null = null;

  // Interactivity
  containerScale = 0.7;
  screenSpaceScale = { value: 1 / this.containerScale };

  dragState = {
    isDragging: false,
    dragStart: { x: 0, y: 0 },
  };

  constructor(
    private app: Application,
    protected network: PeopleNetwork,
    config: { parent: Container }
  ) {
    this.parent = config.parent;
  }

  // Lifecycle
  awake({ bindEvents = true }: { bindEvents?: boolean } = {}) {
    // T -> E
    // | -> N
    this.parent.addChild(this.topLevelContainer);
    this.topLevelContainer.addChild(this.edgesContainer);
    this.topLevelContainer.addChild(this.nodesContainer);

    if (Boolean(bindEvents)) {
      this.bindDragEvents();
      this.bindWheelEvents();
    }
  }

  update() {
    // Play animations
    if (this.network.hasAnimationStarted) {
      this.animateIn({ speed: 1 });
    }

    // Draw the nodes
    Object.values(this.nodes).forEach((node) => {
      node.update();
    });

    // Draw the edges
    Object.values(this.edges).forEach((edge) => {
      edge.update();
    });
  }

  destroy() {
    this.destroyEvents();
    this.topLevelContainer.destroy({ children: true });
  }

  // Events
  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY;
    const direction = Math.sign(delta);
    this.containerScale = clamp(
      Math.exp(direction * -0.1) * this.containerScale,
      0.05,
      2
    );
    this.topLevelContainer.scale.set(this.containerScale);
    this.topLevelContainer.position.set(
      this.network.origin.x * (1 - this.containerScale),
      this.network.origin.y * (1 - this.containerScale)
    );
    this.screenSpaceScale.value = 1 / this.containerScale;
  }
  bindWheelEvents() {
    this.app.canvas.addEventListener("wheel", this.onWheel.bind(this));
    this.app.canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: 0 }));
  }

  onDragStart(e: MouseEvent) {
    if (e.ctrlKey || e.metaKey) {
      this.dragState.isDragging = true;
      this.dragState.dragStart = { x: e.clientX, y: e.clientY };
      setCanvasPointerStyle(this.app.canvas, "grabbing");
    }
  }

  onDragEnd() {
    console.log("drag end");
    this.dragState.isDragging = false;
    setCanvasPointerStyle(this.app.canvas, "auto");
  }

  onDragMove(e: MouseEvent) {
    if (this.dragState.isDragging) {
      const dx = e.clientX - this.dragState.dragStart.x;
      const dy = e.clientY - this.dragState.dragStart.y;
      this.topLevelContainer.position.set(
        this.topLevelContainer.position.x + dx,
        this.topLevelContainer.position.y + dy
      );
      this.dragState.dragStart = { x: e.clientX, y: e.clientY };
    }
  }

  bindDragEvents() {
    this.app.canvas.addEventListener("mousedown", this.onDragStart.bind(this));
    this.app.canvas.addEventListener("mouseup", this.onDragEnd.bind(this));
    this.app.canvas.addEventListener("mousemove", this.onDragMove.bind(this));
  }

  destroyDragEvents() {
    this.app.canvas.removeEventListener(
      "mousedown",
      this.onDragStart.bind(this)
    );
    this.app.canvas.removeEventListener("mouseup", this.onDragEnd.bind(this));
    this.app.canvas.removeEventListener(
      "mousemove",
      this.onDragMove.bind(this)
    );
  }

  destroyEvents() {
    this.destroyDragEvents();
    this.app.canvas.removeEventListener("wheel", this.onWheel.bind(this));
  }

  // Initializers
  initializeNode(node: PNNodeRef) {
    const { network } = this.network.data.style;
    const { nodeStyle } =
      this.network.data.style.connections[node.connectionToOrigin];
    const isOrigin = node.connectionToOrigin === "Origin";
    const rndFac = isOrigin
      ? 0
      : network.randomizeSpawnRadius
      ? Math.random()
      : 1;
    const rndAngle = Math.random() * Math.PI * 2;
    const sinAngle = Math.sin(rndAngle),
      cosAngle = Math.cos(rndAngle);

    const circle = new PNCircle(
      this.app,
      {
        x:
          this.network.origin.x +
          rndFac * (sinAngle * network.spawnRadius * rndFac),
        y:
          this.network.origin.y +
          rndFac * (cosAngle * network.spawnRadius * rndFac),
      },
      0, // To be animated in
      nodeStyle.color,
      isOrigin ? "You" : node.label,
      getDummyPicture,
      {
        style: nodeStyle,
        node: node,
      },
      {
        hoverScale: nodeStyle.hoverScale,
        textVisibleRadiusThresh: nodeStyle.textVisibleRadiusThresh,
        screenSpaceScale: this.screenSpaceScale,
        events: {
          onDragMove: () => {
            // Copy drag position only if the network is not bound to physics
            // otherwise the graphics object updates the shared reference
            // TODO: Unexpected behavior
            // if (this.network.settings.bindPhysicsObjectsToPixi) return;
            // Update the physics object position
            this.network.dynamics.getNode(node.id)!.position.x =
              circle.position.x;
            this.network.dynamics.getNode(node.id)!.position.y =
              circle.position.y;
          },
        },
      }
    );

    circle.parentTo(this.nodesContainer);
    this.nodes[node.id] = circle;

    if (node.connectionToOrigin === "Origin" && this.centerNode !== null) {
      throw new Error("Multiple center nodes found");
    } else if (node.connectionToOrigin === "Origin") {
      this.centerNode = circle;
    }
  }

  // Creates a PNCircle instance for each node
  initializeNodes() {
    for (const node of this.network.data.nodes) {
      this.initializeNode(node);
    }
  }

  initializeEdge(edge: PNEdgeRef) {
    const { edgeStyle } =
      this.network.data.style.connections[edge.connectionType];
    const source = this.nodes[edge.source];
    const target = this.nodes[edge.target];
    const edgeInstance = new PNEdges(
      this.app,
      source.getPosition(),
      target.getPosition(),
      edgeStyle.color,
      edgeStyle.lineStyle,
      "",
      "",
      edgeStyle.width,
      {
        nodeA: source.context.node,
        nodeB: target.context.node,
      },
      {
        screenSpaceScale: this.screenSpaceScale,
      }
    );
    edgeInstance.parentTo(this.edgesContainer);
    this.edges[edge.id] = edgeInstance;
  }

  // Creates a PNEdges instance for each edge
  initializeEdges() {
    for (const edge of this.network.data.edges) {
      this.initializeEdge(edge);
    }
  }

  // Verifies correct setup
  checkCenterNodeExists() {
    if (!this.centerNode) {
      throw new Error("Center node not found");
    }
  }

  // Getters
  getNodes() {
    return this.nodes;
  }

  getEdges() {
    return this.edges;
  }

  getNode(nodeId: string) {
    return this.nodes[nodeId];
  }

  getEdge(edgeId: string) {
    return this.edges[edgeId];
  }

  // Destructors
  removeNode(nodeId: string) {
    // Remove the node from the nodes container
    this.nodes[nodeId].destroy();
    delete this.nodes[nodeId];

    // Remove associated edges
    for (const edgeId in this.edges) {
      if (
        this.edges[edgeId].context.nodeA.id === nodeId ||
        this.edges[edgeId].context.nodeB.id === nodeId
      ) {
        this.edges[edgeId].destroy();
        delete this.edges[edgeId];
      }
    }
  }

  // Animations
  animateIn(settings: { speed: number } = { speed: 1 }) {
    Object.values(this.nodes).forEach((node) => {
      animateScale(node, node.context.style.radius, settings);
    });
  }
}
