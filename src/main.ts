import { Application } from "pixi.js";
import { BG_COLOR_HEX } from "./constants";
import PeopleNetwork from "./components/PeopleNetwork";
import { exampleSimplePeopleNetworkData } from "./components/PeopleNetwork.defaults";
import { Grid } from "./components/Grid";
import Stats from "stats.js";

const params = {
  showStats: true,
};

(async () => {
  // Create a new Stats instance
  var stats = new Stats();
  stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    background: BG_COLOR_HEX,
    resizeTo: window,
    preference: "webgpu",
    antialias: true,
    autoDensity: true,
  });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Create a new background grid
  const grid = new Grid(app, {
    gridSpacing: 15,
    include: {
      lines: false,
      backdrop: false,
    },
  });
  grid.parentTo(app.stage);
  grid.draw();

  // const pnData = generateLargePeopleNetworkData(50, 0.1);
  // const pnData = examplePeopleNetworkData;
  const pnData = exampleSimplePeopleNetworkData;
  const pn = new PeopleNetwork(
    app,
    pnData,
    {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    },
    app.stage,
    {
      incrementalAttach: true,
      incrementalBind: true,
      bindPhysicsObjectsToPixi: true,
    }
  );
  pn.setup(); // Setup the network

  app.ticker.add(() => {
    params.showStats && stats.begin();
    pn.update();
    params.showStats && stats.end();
  });

  document.addEventListener("onresize", () => {
    app.resize();
    grid.destroy();
  });
})();
