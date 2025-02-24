import { Application, Container, PointData } from "pixi.js";
import {
  PNEdgeRef,
  type PeopleNetworkData,
  type PNNodeRef,
} from "./PeopleNetwork.util";
import { animateScale } from "../animations";
import { PNCircle } from "./PeopleNetwork.Circle";
import { Bodies, Body, Engine, Constraint, World, Runner } from "matter-js";
import { PNEdges } from "./PeopleNetwork.Edges";
import { gaussianRandom, sleep } from "../util";
import { IDestroyable } from "../interfaces";

type PNCircleContext = {
  style: {
    color: string;
    radius: number;
  };
  node: PNNodeRef;
};

export default class PeopleNetwork implements IDestroyable {
  // Since the PeopleNetwork animates in
  // from the origin, we need
  // to know if it has already been spawned
  isNetworkSetup: boolean = false;
  hasAnimationStarted: boolean = false;

  topLevelContainer = new Container();
  nodesContainer = new Container();
  edgesContainer = new Container();
  edges: Record<
    string,
    PNEdges<{
      nodeA: PNNodeRef;
      nodeB: PNNodeRef;
    }>
  > = {};

  nodes: Record<string, PNCircle<PNCircleContext>> = {};
  centerNode: PNCircle<PNCircleContext> | null = null;

  engine: Engine = Engine.create();
  runner: Runner = Runner.create();
  bodies: Record<string, Body> = {};

  constructor(
    private app: Application,
    protected data: PeopleNetworkData,
    public origin: PointData,
    parent: Container,
    protected settings: {
      incrementalAttach?: boolean;
    } = {}
  ) {
    // T -> E
    // | -> N
    parent.addChild(this.topLevelContainer);
    this.topLevelContainer.addChild(this.edgesContainer);
    this.topLevelContainer.addChild(this.nodesContainer);
    this.awake();
  }

  async awake() {
    this.engine.gravity.y = 0; // Zero gravity
    Runner.run(this.runner, this.engine); // Start the runner

    if (this.settings.incrementalAttach) {
      await this._incrementalAttach();
    } else {
      this._initializeNodes(); // Creates PNCircle instances
      this._initializeEdges(); // Creates PNEdges instances
      this._checkCenterNodeExists(); // Verifies center node exists
      this._initializePhysics(); // Creates Matter.js bodies and constraints
      this.isNetworkSetup = true; // Set network setup flag
    }
  }

  setup() {
    this.hasAnimationStarted = true;
  }

  update() {
    // Runner.tick(this.runner, this.engine, 1000 / 10);

    // Update physics based on Matter.js
    this._updatePhysics();

    // Handle startup animation
    if (this.hasAnimationStarted) {
      this._animateIn();
    }

    // Draw the nodes
    Object.values(this.nodes).forEach((node) => {
      node.update();
    });
  }

  destroy(): void {
    this.topLevelContainer.destroy({ children: true });
    World.clear(this.engine.world, false);
    Engine.clear(this.engine);
    Runner.stop(this.runner);
  }

  /* Private Methods */

  private async _incrementalAttach() {
    // Incremental attach
    const originNode = this.data.nodes.find(
      (node) => node.connectionToOrigin === "Origin"
    );
    if (originNode) {
      this._initializeNode(originNode);
      this._createNodeBody(originNode, { addToWorld: false });
      this._createNodeBody(originNode);
      this._checkCenterNodeExists();
    }

    const nodesById = Object.fromEntries(
      this.data.nodes.map((node) => [node.id, node])
    );
    const nodesAttached = new Set<string>([originNode!.id]);
    const visited = new Set<string>();
    const iterMax = 100 + this.data.nodes.length;
    let iter = 0;
    while (visited.size < this.data.nodes.length) {
      iter++;
      console.log("Iterating", iter);
      if (iter > iterMax) {
        console.error(
          "Failed to attach all nodes to the origin node. Please check your data."
        );
        break;
      }
      // Add all nodes connected to a given node
      // then add their constraints
      for (const node of nodesAttached) {
        // Skip if already visited
        if (visited.has(node)) {
          continue;
        }
        visited.add(node);

        const edgesToAdd = this.data.edges.filter(
          (edge) => edge.source === node || edge.target === node
        );
        for (const edge of edgesToAdd) {
          const { source, target } = edge;
          let isEdgeAttached = true; // avoid duplicate edges
          if (!nodesAttached.has(source)) {
            this.addNode(nodesById[source]);
            nodesAttached.add(source);
            // an edge is attached if both nodes are attached
            isEdgeAttached = false;
          }
          if (!nodesAttached.has(target)) {
            this.addNode(nodesById[target]);
            nodesAttached.add(target);
            isEdgeAttached = false;
          }
          if (!isEdgeAttached) {
            this.addEdge(edge);
            await sleep(100);
          }
        }
      }
    }
  }

  // Creates a PNCircle instance for a single node
  private _initializeNode(node: PNNodeRef) {
    const { physics } = this.data.style;
    const { nodeStyle } = this.data.style.connections[node.connectionToOrigin];
    const isOrigin = node.connectionToOrigin === "Origin";
    const rndFac = isOrigin ? 0 : 1;
    const circle = new PNCircle(
      this.app,
      {
        x: this.origin.x + rndFac * gaussianRandom(1, physics.edgeLength - 50),
        y: this.origin.y + rndFac * gaussianRandom(1, physics.edgeLength - 50),
      },
      0, // To be animated in
      nodeStyle.color,
      isOrigin ? "You" : node.label,
      (x, y) => {
        // OnDrag
        if (!this.bodies[node.id]) {
          return;
        }
        this.bodies[node.id].position.x = x;
        this.bodies[node.id].position.y = y;
      },
      {
        style: nodeStyle,
        node: node,
      },
      {
        hoverScale: nodeStyle.hoverScale,
        textVisibleRadiusThresh: nodeStyle.textVisibleRadiusThresh,
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
  private _initializeNodes() {
    for (const node of this.data.nodes) {
      this._initializeNode(node);
    }
  }

  private _initializeEdge(edge: PNEdgeRef) {
    const { edgeStyle } = this.data.style.connections[edge.connectionType];
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
      }
    );
    edgeInstance.parentTo(this.edgesContainer);
    this.edges[edge.id] = edgeInstance;
  }

  // Creates a PNEdges instance for each edge
  private _initializeEdges() {
    for (const edge of this.data.edges) {
      this._initializeEdge(edge);
    }
  }

  // Verifies correct setup
  private _checkCenterNodeExists() {
    if (!this.centerNode) {
      throw new Error("Center node not found");
    }
  }

  private _createNodeBody(node: PNNodeRef, { addToWorld = true } = {}) {
    const { x, y } = this.nodes[node.id].getPosition();
    const isOrigin = node.connectionToOrigin === "Origin";
    const { physics } =
      this.data.style.connections[node.connectionToOrigin].nodeStyle;

    this.bodies[node.id] = Bodies.circle(
      x,
      y,
      this.nodes[node.id].context.style.radius,
      {
        inertia: Infinity,
        isStatic: isOrigin,
        ...physics,
      }
    );

    addToWorld && World.add(this.engine.world, this.bodies[node.id]);
  }

  private _createEdgeConstraint(edge: PNEdgeRef, { addToWorld = true } = {}) {
    const { edgeStyle } = this.data.style.connections[edge.connectionType];
    const { physics } = this.data.style;
    const source = this.bodies[edge.source];
    const target = this.bodies[edge.target];
    const constraint = Constraint.create({
      bodyA: source,
      bodyB: target,
      length: (edgeStyle.distanceFactor || 1) * physics.springLength,
      stiffness: physics.springStrength,
      damping: physics.springDamping,
    });

    addToWorld && World.addConstraint(this.engine.world, constraint);
  }

  /** Creates a zero-gravity physics simulation
   * with Matter.js for the nodes and edges
   * to interact with
   *
   * Nodes are static if they are the origin
   * and use bodies with infinite inertia
   *
   * Edges are constraints with a spring-like
   * behavior to keep the nodes connected
   *
   * The actual edges only exist in PixiJS
   */
  private _initializePhysics() {
    // Create bodies
    for (const node of this.data.nodes) {
      this._createNodeBody(node);
    }

    // For each edge, create a constraint
    for (const edge of this.data.edges) {
      this._createEdgeConstraint(edge);
    }
  }

  // Copies all Matter.js body positions to PixiJS objects
  // TODO: Maybe find a way to share the position object
  private _updatePhysics() {
    // Sync Matter.js bodies to PixiJS objects
    Object.entries(this.bodies).forEach(([id, body]) => {
      const node = this.nodes[id];
      if (node) {
        // Update Pixi object position based on Matter body position
        node.moveTo(body.position);
      }
    });

    // Update the edges
    Object.values(this.edges).forEach((edge) => {
      const { nodeA, nodeB } = edge.context;
      // Typically, we would use getPosition() to get a clone
      // but i am being cheap on object recreations
      edge.positionA = this.nodes[nodeA.id].position;
      edge.positionB = this.nodes[nodeB.id].position;
      edge.update();
    });
  }

  // Simple animation to scale in the nodes
  private _animateIn(settings: { speed: number } = { speed: 1 }) {
    Object.values(this.nodes).forEach((node) => {
      animateScale(node, node.context.style.radius, settings);
    });
  }

  // Methods
  addNode(node: PNNodeRef) {
    // Add the node to the data
    this.data.nodes.push(node);

    // Create a new node
    this._initializeNode(node);

    // Create a new body
    this._createNodeBody(node);
  }

  addEdge(edge: PNEdgeRef) {
    // Add the edge to the data
    this.data.edges.push(edge);

    // Create a new edge
    this._initializeEdge(edge);
    this._createEdgeConstraint(edge);
  }

  removeNode(nodeId: string) {
    // Remove the node from the data
    this.data.nodes = this.data.nodes.filter((node) => node.id !== nodeId);

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

    // Remove associated constraints
    const thisNodeBodyId = this.bodies[nodeId].id;
    const constraintsToRemove = this.engine.world.constraints.filter(
      (constraint) => {
        return (
          constraint.bodyA!.id === thisNodeBodyId ||
          constraint.bodyB!.id === thisNodeBodyId
        );
      }
    );

    constraintsToRemove.forEach((constraint) => {
      World.remove(this.engine.world, constraint);
    });

    // Remove the body from the physics engine
    World.remove(this.engine.world, this.bodies[nodeId]);
    delete this.bodies[nodeId];
  }

  private __test__ = {
    addNode: () =>
      this.addNode({ id: "212", label: "Test", connectionToOrigin: "Family" }),
    addEdge: () =>
      this.addEdge({
        id: "212",
        source: "1",
        target: "212",
        connectionType: "Family",
      }),
    removeNode: () => this.removeNode("212"),
  };
}
