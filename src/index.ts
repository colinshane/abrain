import './css/index.css';
import * as Three from 'three';
import EventProcessingEngine from "./core/EventProcessingEngine";
import BrowserUtils from "./utils/BrowserUtils";


/* Create the global event processing engine for browser related events */
const GlobalBrowserEventProcessingEngine = new EventProcessingEngine();
const OnMouseMoveCallback = GlobalBrowserEventProcessingEngine.CreateEvent("OnMouseMove");
document.addEventListener("mousemove", OnMouseMoveCallback as any, false);
const OnTouchStartCallback = GlobalBrowserEventProcessingEngine.CreateEvent("OnTouchStart");
document.addEventListener("touchstart", OnTouchStartCallback as any, false);
const OnTouchMoveCallback = GlobalBrowserEventProcessingEngine.CreateEvent("OnTouchMove");
document.addEventListener("touchmove", OnTouchMoveCallback as any, false);
const OnWindowResizeCallback = GlobalBrowserEventProcessingEngine.CreateEvent("OnWindowResize");
window.addEventListener("resize", OnWindowResizeCallback as any, false);
const OnTickCallback = GlobalBrowserEventProcessingEngine.CreateEvent("OnTick");
GlobalBrowserEventProcessingEngine.Subscribe("OnTick", null, () => {
  window.requestAnimationFrame(OnTickCallback as any);
});
OnTickCallback();


class Camera extends Three.PerspectiveCamera {
  constructor() {
    super(40, window.innerWidth / window.innerHeight, 1, 15000);
    this.position.z = 250;
  }
};

class Scene extends Three.Scene {
  constructor() {
    super();
    this.background = new Three.Color().setHSL( 0.51, 0.4, 0.01 );
    this.fog = new Three.Fog( this.background, 3500, 15000 );
  }
};

class Neuron extends Three.Mesh {
  constructor(x: number, y: number) {
    super(
      new Three.SphereGeometry( 15, 8, 8 ), 
      new Three.MeshBasicMaterial( {color: 0xFFFFFF} )
    );
    this.position.x = x;
    this.position.y = y;
  }
};

class Renderer extends Three.WebGLRenderer {
  constructor(private scene: Scene, private camera: Camera) {
    super({antialias: true, alpha: true});
    this.setPixelRatio( window.devicePixelRatio );
    this.setSize( window.innerWidth, window.innerHeight );
    GlobalBrowserEventProcessingEngine.Subscribe("OnTick", this, this.OnTick);
  }
  OnTick() {
    this.render(this.scene, this.camera);
  }
};

class NavigationSystem {
  constructor(private scene: Scene, private camera: Camera, private renderer: Renderer) {
    this.OnWindowResize(null); // Initial size set-up
    GlobalBrowserEventProcessingEngine.Subscribe("OnMouseMove", this, this.OnMouseMove);
    GlobalBrowserEventProcessingEngine.Subscribe("OnTouchStart", this, this.OnTouchStart);
    GlobalBrowserEventProcessingEngine.Subscribe("OnTouchMove", this, this.OnTouchMove);
    GlobalBrowserEventProcessingEngine.Subscribe("OnWindowResize", this, this.OnWindowResize);
    GlobalBrowserEventProcessingEngine.Subscribe("OnTick", this, this.OnTick);
  }
  
  OnTick() {
    this.camera.position.x += ( this.MouseX - this.camera.position.x ) * .05;
    this.camera.position.y += ( - this.MouseY + 200 - this.camera.position.y ) * .05;
    this.camera.lookAt( this.scene.position );
  }
  OnMouseMove(event: any) {
    this.MouseX = event.clientX - this.WindowHalfWidth;
    this.MouseY = event.clientY - this.WindowHalfHeight;
  }
  OnTouchStart(event: any) {
    if ( event.touches.length > 1 ) {
      event.preventDefault();
      this.MouseX = event.touches[ 0 ].pageX - this.WindowHalfWidth;
      this.MouseY = event.touches[ 0 ].pageY - this.WindowHalfHeight;
    }
  }
  OnTouchMove(event: any) {
    if ( event.touches.length == 1 ) {
      event.preventDefault();
      this.MouseX = event.touches[ 0 ].pageX - this.WindowHalfWidth;
      this.MouseY = event.touches[ 0 ].pageY - this.WindowHalfHeight;
    }
  }
  OnWindowResize(event: any) {
    let browserDimensions = BrowserUtils.GetBrowserDimension();
    this.WindowHalfWidth = browserDimensions.width / 2;
    this.WindowHalfHeight = browserDimensions.height / 2;
    this.renderer.setSize( browserDimensions.width, browserDimensions.height );
    this.camera.aspect = browserDimensions.width / browserDimensions.height;
    this.camera.updateProjectionMatrix();
  }
  MouseX: number = 0;
  MouseY: number = 0;
  WindowHalfWidth: number = 0;
  WindowHalfHeight: number = 0;
}

(function main() {
  let camera = new Camera();
  let scene = new Scene();
  let neuron = new Neuron(0, 0);
  scene.add(neuron);
  let neuron2 = new Neuron(50, 30);
  scene.add(neuron2);
  //var light = new Three.AmbientLight(0xffffff);
  //scene.add(light);
  let renderer = new Renderer(scene, camera);
  let navigationSystem = new NavigationSystem(scene, camera, renderer);
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);  
})();