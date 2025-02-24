import { IBodyDefinition } from "matter-js";
import { PNLineStyle, PeopleNetworkData } from "./PeopleNetwork.util";

export const defaultConnectionsStyle = {
  Origin: {
    nodeStyle: {
      physics: {},
      color: "#d4d4d4", // Soft blue
      radius: 50,
    },
    edgeStyle: {
      color: "#d4d4d4",
      width: 0,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
    },
  },
  Family: {
    nodeStyle: {
      physics: {},
      color: "#fd85ff", // Soft teal
      radius: 40,
    },
    edgeStyle: {
      color: "#fd85ff",
      width: 3,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
    },
  },

  Friend: {
    nodeStyle: {
      physics: {},
      color: "#32a852", // Soft pastel blue
      radius: 40,
    },
    edgeStyle: {
      color: "#32a852",
      width: 2,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 1.25,
    },
  },

  Partner: {
    nodeStyle: {
      physics: {},
      color: "#FFC8DD", // Soft pastel pink
      radius: 45,
    },
    edgeStyle: {
      color: "#FFC8DD",
      width: 4,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 0.75,
    },
  },

  Colleague: {
    nodeStyle: {
      physics: {},
      color: "#FAF3DD", // Soft off-white/yellow
      radius: 25,
    },
    edgeStyle: {
      color: "#FAF3DD",
      width: 1,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 1.5,
    },
  },

  Acquaintance: {
    nodeStyle: {
      physics: {},
      color: "#CAFFBF", // Soft pastel green
      radius: 25,
    },
    edgeStyle: {
      color: "#CAFFBF",
      width: 1,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 1.75,
    },
  },

  Stranger: {
    nodeStyle: {
      physics: {},
      color: "#FFD97D", // Soft pastel orange/yellow
      radius: 10,
    },
    edgeStyle: {
      color: "#FFD97D",
      width: 2,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 2.0,
    },
  },
};

// Example of a more varied styling for each connection type
export const enhancedConnectionsStyle = {
  Origin: {
    nodeStyle: {
      physics: {
        mass: 1,
        friction: 0.5,
        frictionAir: 0.1,
        frictionStatic: 0.5,
        restitution: 0.5,
        density: 0.5,
        inertia: 0.5,
      },
      color: "#2A004E",
      radius: 80,
    },
    edgeStyle: {
      color: "#2A004E",
      width: 0,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
    },
  },
  Family: {
    nodeStyle: {
      physics: {},
      color: "#758694",
      radius: 40,
    },
    edgeStyle: {
      color: "#758694",
      width: 3,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
    },
  },
  Friend: {
    nodeStyle: {
      physics: {},
      color: "#F3C623",
      radius: 40,
    },
    edgeStyle: {
      color: "#F3C623",
      width: 2,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 1.25,
    },
  },
  Partner: {
    nodeStyle: {
      physics: {
        isStatic: true,
      } as IBodyDefinition,
      color: "#C62300",
      radius: 60,
    },
    // Example of using a dashed line for Partner
    edgeStyle: {
      color: "#fff",
      width: 10,
      lineStyle: PNLineStyle.dashed,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 0.9,
    },
  },
  Colleague: {
    nodeStyle: {
      physics: {},
      color: "#758694",
      radius: 25,
    },
    edgeStyle: {
      color: "#758694",
      width: 1,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 1.5,
    },
  },
  Acquaintance: {
    nodeStyle: {
      physics: {},
      color: "#758694",
      radius: 25,
    },
    edgeStyle: {
      color: "#758694",
      width: 1,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 1.75,
    },
  },
  Stranger: {
    nodeStyle: {
      physics: {},
      color: "#758694",
      radius: 20,
    },
    // Example of using a dotted line for Stranger
    edgeStyle: {
      color: "#758694",
      width: 2,
      lineStyle: PNLineStyle.dotted,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 2.0,
    },
  },
};

export const examplePeopleNetworkData: PeopleNetworkData = {
  nodes: [
    { id: "1", label: "Alice", connectionToOrigin: "Origin" },
    { id: "2", label: "Bob", connectionToOrigin: "Family" },
    { id: "3", label: "Charlie", connectionToOrigin: "Friend" },
    { id: "4", label: "David", connectionToOrigin: "Colleague" },
    { id: "5", label: "Eve", connectionToOrigin: "Acquaintance" },
    { id: "6", label: "Zoe", connectionToOrigin: "Partner" },

    { id: "7", label: "Zoe's Mom", connectionToOrigin: "Family" },
    { id: "8", label: "Zoe's Dad", connectionToOrigin: "Family" },
    { id: "9", label: "Zoe's Sister", connectionToOrigin: "Family" },
    { id: "10", label: "Zoe's Brother", connectionToOrigin: "Family" },
  ],
  edges: [
    { id: "1", source: "1", target: "2", connectionType: "Family" },
    { id: "2", source: "1", target: "3", connectionType: "Friend" },
    { id: "3", source: "1", target: "4", connectionType: "Colleague" },
    { id: "4", source: "1", target: "5", connectionType: "Acquaintance" },

    { id: "5", source: "2", target: "3", connectionType: "Family" },
    { id: "6", source: "2", target: "4", connectionType: "Friend" },

    { id: "9", source: "3", target: "5", connectionType: "Friend" },

    { id: "10", source: "4", target: "5", connectionType: "Family" },

    { id: "11", source: "1", target: "6", connectionType: "Partner" },

    { id: "12", source: "6", target: "7", connectionType: "Family" },
    { id: "13", source: "6", target: "8", connectionType: "Family" },
    { id: "14", source: "6", target: "9", connectionType: "Family" },
    { id: "15", source: "6", target: "10", connectionType: "Family" },
  ],

  centerNodeId: "1",

  sizingFactor: 1,

  style: {
    connections: {
      ...enhancedConnectionsStyle,
    },
    physics: {
      springLength: 300,
      springStrength: 0.01,
      springDamping: 0.01,
      edgeLength: 300,
    },
  },
};

export const exampleSimplePeopleNetworkData: PeopleNetworkData = {
  nodes: [
    { id: "1", label: "Alice", connectionToOrigin: "Origin" },
    { id: "2", label: "Bob", connectionToOrigin: "Family" },
  ],
  edges: [{ id: "1", source: "1", target: "2", connectionType: "Family" }],
  centerNodeId: "1",
  sizingFactor: 1,
  style: {
    connections: {
      ...defaultConnectionsStyle,
    },
    physics: {
      springLength: 500,
      springStrength: 0.001,
      springDamping: 0.01,
      edgeLength: 1000,
    },
  },
};
