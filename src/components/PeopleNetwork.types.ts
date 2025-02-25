import { Body, IBodyDefinition, IConstraintDefinition } from "matter-js";
import { TextStyle } from "pixi.js";
import { PNCircle } from "./PeopleNetwork.Circle";
import { PNEdges } from "./PeopleNetwork.Edges";

export enum PNLineStyle {
  solid = "solid",
  dashed = "dashed",
  dotted = "dotted",
}

export type PNNodeStyle = {
  color: string;
  radius: number;
  hoverScale?: number;
  textVisibleRadiusThresh?: number;
  textStyle?: Partial<TextStyle>;
  physics: IBodyDefinition;
};

export type PNEdgeStyle = {
  color: string;
  width: number;
  lineStyle: PNLineStyle;
  showArrow: boolean;
  showCounters: boolean;
  counterColor: string | null;
  distanceFactor?: number; // 1.0 is default
  physics: Omit<IConstraintDefinition, "bodyA" | "bodyB">;
};

export type PNConnectionStyle = {
  nodeStyle: PNNodeStyle;
  edgeStyle: PNEdgeStyle;
};

export type PNNodeRef = {
  id: string;
  label: string;
  connectionToOrigin: keyof PNConnectionsStyle | "Origin";
};

export type PNEdgeRef = {
  id: string;
  source: string;
  target: string;
  connectionType: keyof PNConnectionsStyle;
};

interface PNConnectionsStyle {
  Family: PNConnectionStyle;
  Friend: PNConnectionStyle;
  Partner: PNConnectionStyle;
  Colleague: PNConnectionStyle;
  Acquaintance: PNConnectionStyle;
  Stranger: PNConnectionStyle; // MetOnce, MetMultipleTimes, HungOutOnce, HungOutMultipleTimes, Introduced, etc.
  [key: string]: PNConnectionStyle;
}

export type PeopleNetworkData = {
  nodes: Array<PNNodeRef>;
  edges: Array<PNEdgeRef>;
  centerNodeId: string;
  sizingFactor: number;
  style: {
    connections: PNConnectionsStyle;
    network: {
      spawnRadius: number;
      randomizeSpawnRadius: boolean;
    };
  };
};

// A common interface so that every class can be swapped in/out.
export interface IAwakeSetupUpdate {
  awake(): Promise<void> | void;
  setup(): void;
  update(): void;
}

// Data passed to be held by the node class
export type PNCircleContext = {
  style: {
    color: string;
    radius: number;
  };
  node: PNNodeRef;
};

// Accessor interfaces allow one child class to call into the other
export interface IPeopleNetworkDynamicsAccessor {
  // Lifecycle
  awake({ run }: { run?: boolean }): void;
  run(): void;
  tick(deltaMS: number): void;
  stop(): void;
  destroy(): void;

  initialize(): void;
  update(): void;

  // Creation
  createNode(node: PNNodeRef, options?: { addToWorld?: boolean }): void;
  createEdgeConstraint(
    edge: PNEdgeRef,
    options?: { addToWorld?: boolean }
  ): void;

  // Destruction
  removeNode(nodeId: string): void;

  // Getters
  getNode(nodeId: string): Body | undefined;

  // Dynamics
  bindNodeFromRef(node: PNCircle<PNCircleContext>, body: Body): void;
  bindEdgeFromRef(edge: PNEdges<any>, bodyA: Body, bodyB: Body): void;
  bindFromRef(): void;
}

export interface IPeopleNetworkGraphicsAccessor {
  initializeNode(node: PNNodeRef): void;
  initializeNodes(): void;
  initializeEdge(edge: PNEdgeRef): void;
  initializeEdges(): void;
  bindWheelEvents(): void;
  bindDragEvents(): void;
  updateGraphics(): void;
}

export const REF_RADIUS = 40;
