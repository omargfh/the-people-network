import { IBodyDefinition, IConstraintDefinition } from "matter-js";
import { PNLineStyle, PeopleNetworkData } from "./PeopleNetwork.types";

// Physics defaults
export const defaultNodePhysics: IBodyDefinition = {
  mass: 1,
  friction: 0.2, // Moderate friction for smooth sliding
  frictionAir: 0.05, // Damping for natural deceleration
  restitution: 0.1, // Minimal bounce for a solid feel
};

export const defaultEdgePhysics: IConstraintDefinition = {
  length: 500,
  stiffness: 0.08,
  damping: 0.1,
  type: "spring",
};

export const defaultNetworkStyle: PeopleNetworkData["style"]["network"] = {
  spawnRadius: 300,
  randomizeSpawnRadius: true,
};

// Example of a simple styling for each connection type
export const defaultConnectionsStyle = {
  Origin: {
    nodeStyle: {
      physics: defaultNodePhysics,
      color: "#d4d4d4", // Soft blue
      radius: 50,
    },
    edgeStyle: {
      physics: defaultEdgePhysics,
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
      physics: defaultNodePhysics,
      color: "#fd85ff", // Soft teal
      radius: 40,
    },
    edgeStyle: {
      physics: defaultEdgePhysics,
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
      physics: defaultNodePhysics,
      color: "#32a852", // Soft pastel blue
      radius: 40,
    },
    edgeStyle: {
      physics: defaultEdgePhysics,
      color: "#32a852",
      width: 2,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 2.5,
    },
  },

  Partner: {
    nodeStyle: {
      physics: {
        ...defaultNodePhysics,
      } as IBodyDefinition,
      color: "#FFC8DD", // Soft pastel pink
      radius: 45,
    },
    edgeStyle: {
      physics: {
        ...defaultEdgePhysics,
        stiffness: 0.00001,
      } as IConstraintDefinition,
      color: "#FFC8DD",
      width: 4,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 20,
    },
  },

  Colleague: {
    nodeStyle: {
      physics: defaultNodePhysics,
      color: "#FAF3DD", // Soft off-white/yellow
      radius: 25,
    },
    edgeStyle: {
      physics: defaultEdgePhysics,
      color: "#FAF3DD",
      width: 1,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 3.0,
    },
  },

  Acquaintance: {
    nodeStyle: {
      physics: defaultNodePhysics,
      color: "#CAFFBF", // Soft pastel green
      radius: 25,
    },
    edgeStyle: {
      physics: defaultEdgePhysics,
      color: "#CAFFBF",
      width: 1,
      lineStyle: PNLineStyle.solid,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 4,
    },
  },

  Stranger: {
    nodeStyle: {
      physics: defaultNodePhysics,
      color: "#FFD97D", // Soft pastel orange/yellow
      radius: 10,
    },
    edgeStyle: {
      physics: defaultEdgePhysics,
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
      physics: defaultEdgePhysics,
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
      physics: defaultEdgePhysics,
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
      physics: defaultEdgePhysics,
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
        // isStatic: true,
      } as IBodyDefinition,
      color: "#C62300",
      radius: 60,
    },
    // Example of using a dashed line for Partner
    edgeStyle: {
      physics: {
        ...defaultEdgePhysics,
        stiffness: 1,
      } as IConstraintDefinition,
      color: "#fff",
      width: 10,
      lineStyle: PNLineStyle.dashed,
      showArrow: false,
      showCounters: false,
      counterColor: null,
      distanceFactor: 1.2,
    },
  },
  Colleague: {
    nodeStyle: {
      physics: {},
      color: "#758694",
      radius: 25,
    },
    edgeStyle: {
      physics: defaultEdgePhysics,
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
      physics: defaultEdgePhysics,
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
      physics: defaultEdgePhysics,
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

    { id: "9", source: "3", target: "5", connectionType: "Friend" },

    { id: "10", source: "4", target: "5", connectionType: "Family" },

    { id: "11", source: "1", target: "6", connectionType: "Partner" },

    { id: "16", source: "7", target: "8", connectionType: "Partner" },
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
    network: defaultNetworkStyle,
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
    network: defaultNetworkStyle,
  },
};

export const myPeopleNetworkData: PeopleNetworkData = {
  nodes: [
    { id: "1", label: "Omar", connectionToOrigin: "Origin" },
    { id: "2", label: "Zeyna", connectionToOrigin: "Partner" },

    { id: "3", label: "George I", connectionToOrigin: "Friend" },
    { id: "4", label: "Abdelrahman M.", connectionToOrigin: "Acquaintance" },
    { id: "5", label: "Sara A.", connectionToOrigin: "Friend" },
    { id: "6", label: "Sara S.", connectionToOrigin: "Friend" },
    { id: "7", label: "Burhan M.", connectionToOrigin: "Friend" },
    { id: "8", label: "Ashly", connectionToOrigin: "Friend" },
    { id: "9", label: "Mona", connectionToOrigin: "Friend" },
    { id: "10", label: "Rabab", connectionToOrigin: "Friend" },

    { id: "11", label: "Sara", connectionToOrigin: "Family" },
    { id: "12", label: "Gana", connectionToOrigin: "Family" },
    { id: "13", label: "Mariam", connectionToOrigin: "Family" },
  ],
  edges: [
    { id: "1", source: "1", target: "2", connectionType: "Partner" },
    { id: "2", source: "1", target: "3", connectionType: "Friend" },
    { id: "3", source: "1", target: "4", connectionType: "Family" },
    { id: "4", source: "1", target: "5", connectionType: "Friend" },
    { id: "5", source: "1", target: "6", connectionType: "Friend" },
    { id: "6", source: "1", target: "7", connectionType: "Friend" },
    { id: "7", source: "1", target: "8", connectionType: "Friend" },
    { id: "8", source: "1", target: "9", connectionType: "Friend" },
    { id: "9", source: "1", target: "10", connectionType: "Friend" },

    { id: "10", source: "1", target: "11", connectionType: "Family" },
    { id: "11", source: "1", target: "12", connectionType: "Family" },
    { id: "12", source: "1", target: "13", connectionType: "Family" },

    { id: "13", source: "9", target: "10", connectionType: "Friend" },
    { id: "14", source: "9", target: "5", connectionType: "Friend" },
    { id: "15", source: "9", target: "6", connectionType: "Friend" },
    { id: "16", source: "9", target: "7", connectionType: "Friend" },

    { id: "18", source: "11", target: "12", connectionType: "Family" },
    { id: "19", source: "11", target: "13", connectionType: "Family" },

    { id: "20", source: "7", target: "8", connectionType: "Friend" },

    { id: "21", source: "4", target: "2", connectionType: "Family" },
  ],

  centerNodeId: "1",

  sizingFactor: 1,

  style: {
    connections: {
      ...enhancedConnectionsStyle,
    },
    network: defaultNetworkStyle,
  },
};

// Large Object
export const generateLargePeopleNetworkData = (
  nNodes: number,
  connectionChance = 0.5
) => {
  const nodes = [];
  const edges = [];
  for (let i = 0; i < nNodes; i++) {
    nodes.push({
      id: `${i}`,
      label: `Person ${i}`,
      connectionToOrigin: i === 0 ? "Origin" : "Friend",
    });
    for (let j = 0; j < i; j++) {
      if (Math.random() < connectionChance) {
        edges.push({
          id: `${i}-${j}`,
          source: `${i}`,
          target: `${j}`,
          connectionType: "Friend",
        });
      }
    }
  }
  return {
    nodes,
    edges,
    centerNodeId: "0",
    sizingFactor: 1,
    style: {
      connections: {
        ...defaultConnectionsStyle,
      },
    },
  };
};
