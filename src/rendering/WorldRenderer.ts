import { BrowserEventProcessingEngine } from "../core/Globals";
import BrowserUtils from "../utils/BrowserUtils";
import * as Three from 'three';
import NavigationSystem from "./NavigationSystem";

export class Scene extends Three.Scene {
  constructor() {
    super();
    this.background = new Three.Color().setHSL(0.51, 0.4, 0.01);
    this.fog = new Three.Fog(this.background, 3500, 15000);
  }
};

export class WorldRenderer extends Three.WebGLRenderer {
  constructor(private scene: Three.Scene, private camera: Three.PerspectiveCamera) {
    super({antialias: true, alpha: true});
    this.setPixelRatio( window.devicePixelRatio );
    this.setSize( window.innerWidth, window.innerHeight );
    BrowserEventProcessingEngine.Subscribe("OnFrameTick", this, this.OnFrameTick);
    BrowserEventProcessingEngine.Subscribe("OnWindowResize", this, this.OnWindowResize);
  }
  OnFrameTick() {
    this.render(this.scene, this.camera);
  }
  OnWindowResize(event: any) {
    let browserDimensions = BrowserUtils.GetBrowserDimension();
    this.setSize( browserDimensions.Width, browserDimensions.Height );
  }
};