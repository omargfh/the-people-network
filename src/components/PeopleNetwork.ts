import { Application, Container, PointData } from "pixi.js";
import {
  IAwakeSetupUpdate,
  PNEdgeRef,
  type PeopleNetworkData,
  type PNNodeRef,
} from "./PeopleNetwork.types";
import { sleep, USED } from "../util";
import { IDestroyable } from "../interfaces";
import PeopleNetworkDynamics from "./PeopleNetwork.Dynamics";
import PeopleNetworkGraphics from "./PeopleNetwork.Graphics";

export default class PeopleNetwork implements IAwakeSetupUpdate, IDestroyable {
  // Since the PeopleNetwork animates in
  // from the origin, we need
  // to know if it has already been spawned
  isNetworkSetup: boolean = false;
  hasAnimationStarted: boolean = false;

  public dynamics: PeopleNetworkDynamics;
  public graphics: PeopleNetworkGraphics;

  constructor(
    private app: Application,
    public data: PeopleNetworkData,
    public origin: PointData,
    public parent: Container,
    public settings: {
      incrementalAttach?: boolean;
      incrementalBind?: boolean;
      // This parameter binds the physics objects to the PixiJS objects
      // instead of updating the PixiJS objects based on the physics objects
      // offering better performance.
      // Whether this is sustainable or not (does Matter.js change pointers?)
      // is unknown. We will test this out.
      bindPhysicsObjectsToPixi?: boolean;
    } = {}
  ) {
    // Create the dependencies
    this.dynamics = new PeopleNetworkDynamics(this);
    this.graphics = new PeopleNetworkGraphics(this.app, this, {
      parent: this.parent,
    });

    this.awake();
    USED(this.__test__);
  }

  async awake() {
    // Run dependencies
    this.graphics.awake();
    this.dynamics.awake({ run: true });

    // prettier-ignore
    const {
      bindPhysicsObjectsToPixi,
      incrementalAttach,
      incrementalBind
    } = this.settings;

    if (incrementalAttach) {
      await this._incrementalAttach();
      if (bindPhysicsObjectsToPixi && !incrementalBind)
        this.dynamics.bindFromRef();
    } else {
      this.graphics.initializeNodes(); // Creates PNCircle instances
      this.graphics.initializeEdges(); // Creates PNEdges instances
      this.graphics.checkCenterNodeExists(); // Verifies center node exists
      this.dynamics.initialize(); // Creates Matter.js bodies and constraints
      if (bindPhysicsObjectsToPixi) this.dynamics.bindFromRef();
      this.isNetworkSetup = true; // Set network setup flag
    }
  }

  setup() {
    this.hasAnimationStarted = true;
  }

  update() {
    // Update the physics if not bound
    if (!this.settings.bindPhysicsObjectsToPixi) this.dynamics.update();
    this.graphics.update();
  }

  destroy(): void {
    this.graphics.destroy();
    this.dynamics.destroy();
  }

  /* Private Methods */
  private async _incrementalAttach() {
    // Find the origin node.
    const originNode = this.data.nodes.find(
      (node) => node.connectionToOrigin === "Origin"
    );
    if (!originNode) {
      console.error("No origin node found. Cannot attach nodes.");
      return;
    }

    // Initialize and create the origin node.
    this.graphics.initializeNode(originNode);
    this.graphics.checkCenterNodeExists();
    this.dynamics.createNode(originNode);

    // Map nodes by ID for quick lookup.
    const nodesById = Object.fromEntries(
      this.data.nodes.map((node) => [node.id, node])
    );

    // Use a set to track attached nodes.
    const nodesAttached = new Set<string>();
    nodesAttached.add(originNode.id);

    // Use a queue for breadth-first traversal.
    const queue: string[] = [originNode.id];
    const visited = new Set<string>();
    const addedEdges = new Set<string>();

    // Limit iterations to avoid an infinite loop in case of disconnected nodes.
    const iterMax = 100 + this.data.nodes.length;
    let iter = 0;

    const bindNode =
      this.settings.bindPhysicsObjectsToPixi && this.settings.incrementalBind
        ? this.dynamics.bindNodeFromRef
        : () => {}; // Reduce conditionals in loop
    const bindEdge =
      this.settings.bindPhysicsObjectsToPixi && this.settings.incrementalBind
        ? this.dynamics.bindEdgeFromRef
        : () => {}; // Reduce conditionals in loop

    while (queue.length && visited.size < this.data.nodes.length) {
      iter++;
      if (iter > iterMax) {
        console.error(
          "Failed to attach all nodes to the origin node. Please check your data."
        );
        break;
      }

      const currentNodeId = queue.shift()!;
      if (visited.has(currentNodeId)) {
        continue;
      }
      visited.add(currentNodeId);

      // Find all edges connected to the current node.
      const connectedEdges = this.data.edges.filter(
        (edge) => edge.source === currentNodeId || edge.target === currentNodeId
      );

      for (const edge of connectedEdges) {
        if (addedEdges.has(edge.id)) {
          continue;
        }
        addedEdges.add(edge.id);

        const { source, target } = edge;

        // If the source node isn't attached, add it.
        for (const node of [source, target]) {
          if (!nodesAttached.has(node)) {
            this.addNode(nodesById[node]);
            nodesAttached.add(node);
            queue.push(node);
            if (
              this.settings.incrementalBind &&
              this.settings.bindPhysicsObjectsToPixi
            ) {
              bindNode(
                this.graphics.getNode(node),
                this.dynamics.getNode(node)!
              );
            }
          }
        }

        // If any new node was added via this edge, add the edge and wait.
        this.addEdge(edge);
        if (this.settings.bindPhysicsObjectsToPixi) {
          bindEdge(
            this.graphics.getEdge(edge.id),
            this.dynamics.getNode(source)!,
            this.dynamics.getNode(target)!
          );
        }
        await sleep(100);
      }
    }
  }

  // Methods
  addNode(node: PNNodeRef) {
    // Add the node to the data
    this.data.nodes.push(node);

    // Create a new node
    this.graphics.initializeNode(node);

    // Create a new body
    this.dynamics.createNode(node);
  }

  addEdge(edge: PNEdgeRef) {
    // Add the edge to the data
    this.data.edges.push(edge);

    // Create a new edge
    this.graphics.initializeEdge(edge);
    this.dynamics.createEdgeConstraint(edge);
  }

  removeNode(nodeId: string) {
    // Remove the node from the data
    this.data.nodes = this.data.nodes.filter((node) => node.id !== nodeId);

    // Remove the node from the graphics
    this.graphics.removeNode(nodeId);
    this.dynamics.removeNode(nodeId);
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
