import { Bodies, Body, Constraint, Engine, Runner, World } from "matter-js";
import {
  IPeopleNetworkDynamicsAccessor,
  PNCircleContext,
  PNEdgeRef,
  PNNodeRef,
} from "./PeopleNetwork.types";
import PeopleNetwork from "./PeopleNetwork";
import { PNCircle } from "./PeopleNetwork.Circle";
import { PNEdges } from "./PeopleNetwork.Edges";
import { PointData } from "pixi.js";

export default class PeopleNetworkDynamics
  implements IPeopleNetworkDynamicsAccessor
{
  engine: Engine = Engine.create();
  runner: Runner = Runner.create();
  bodies: Record<string, Body> = {};

  constructor(protected network: PeopleNetwork) {}

  awake({ run }: { run?: boolean } = {}) {
    this.engine.gravity.y = 0; // Zero gravity
    run && Runner.run(this.runner, this.engine); // Start the runner
  }

  run() {
    Runner.run(this.runner, this.engine);
  }

  tick(deltaMS: number) {
    Runner.tick(this.runner, this.engine, deltaMS);
  }

  stop() {
    Runner.stop(this.runner);
  }

  destroy(): void {
    Runner.stop(this.runner);
    World.clear(this.engine.world, false);
    Engine.clear(this.engine);

    this.bodies = {};
  }

  initialize() {
    // Create bodies
    for (const node of this.network.data.nodes) {
      this.createNode(node);
    }

    // For each edge, create a constraint
    for (const edge of this.network.data.edges) {
      this.createEdgeConstraint(edge);
    }
  }

  update() {
    // Sync Matter.js bodies to PixiJS objects
    Object.entries(this.bodies).forEach(([id, body]) => {
      const node = this.network.graphics.getNode(id);
      if (node) {
        // Update Pixi object position based on Matter body position
        node.moveTo(body.position);
      }
    });
    // Update the edges
    Object.values(this.network.graphics.getEdges()).forEach((edge) => {
      const { nodeA, nodeB } = edge.context;
      // Typically, we would use getPosition() to get a clone
      // but i am being cheap on object recreations
      edge.positionA = this.network.graphics.getNode(nodeA.id).position;
      edge.positionB = this.network.graphics.getNode(nodeB.id).position;
    });
  }

  // Creation
  createNode(node: PNNodeRef, { addToWorld = true } = {}): void {
    const gNode = this.network.graphics.getNode(node.id);
    const { x, y } = gNode.getPosition();
    const isOrigin = node.connectionToOrigin === "Origin";
    const { physics } =
      this.network.data.style.connections[node.connectionToOrigin].nodeStyle;

    this.bodies[node.id] = Bodies.circle(x, y, gNode.context.style.radius, {
      isStatic: isOrigin,
      ...physics,
    });

    addToWorld && World.add(this.engine.world, this.bodies[node.id]);
  }

  createEdgeConstraint(edge: PNEdgeRef, { addToWorld = true } = {}) {
    const { edgeStyle } =
      this.network.data.style.connections[edge.connectionType];
    const source = this.bodies[edge.source];
    const target = this.bodies[edge.target];
    const constraint = Constraint.create({
      bodyA: source,
      bodyB: target,
      ...edgeStyle.physics,
      length: (edgeStyle.distanceFactor || 1) * edgeStyle.physics.length!,
    });

    addToWorld && World.addConstraint(this.engine.world, constraint);
  }

  // Binding
  bindNodeFromRef(node: PNCircle<PNCircleContext>, body: Body) {
    node.bindPositionReference(body.position);
  }

  bindEdgeFromRef(edge: PNEdges<any>, bodyA: Body, bodyB: Body) {
    edge.bindPositions(
      bodyA.position as PointData,
      bodyB.position as PointData
    );
  }

  bindFromRef() {
    // Sync Matter.js bodies to PixiJS objects
    Object.entries(this.bodies).forEach(([id, body]) => {
      const node = this.network.graphics.getNode(id);
      if (node) {
        this.bindNodeFromRef(node, body);
      } else {
        console.error("Node not found for body", id);
      }
    });

    // Update the edges
    Object.values(this.network.graphics.getEdges()).forEach((edge) => {
      const { nodeA, nodeB } = edge.context;
      // Typically, we would use getPosition() to get a clone
      // but i am being cheap on object recreations
      this.bindEdgeFromRef(edge, this.bodies[nodeA.id], this.bodies[nodeB.id]);
    });
  }

  // Destruction
  removeNode(nodeId: string) {
    // Remove associated constraints
    const thisNodeBodyId = this.bodies[nodeId].id;
    if (!thisNodeBodyId) {
      console.error("Body not found for node", nodeId);
      return;
    }

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

  // Getters
  getNode(nodeId: string): Body | undefined {
    return this.bodies[nodeId];
  }
}
