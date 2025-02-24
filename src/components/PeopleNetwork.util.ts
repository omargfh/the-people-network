import { IBodyDefinition } from "matter-js";
import { TextStyle } from "pixi.js";

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
    physics: {
      springLength: number;
      springStrength: number;
      springDamping: number;
      edgeLength: number;
    };
  };
};

export const REF_RADIUS = 40;
