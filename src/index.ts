import './css/index.css';
import * as Three from 'three';
import EventProcessingEngine from "./core/EventProcessingEngine";
import BrowserUtils from "./utils/BrowserUtils";
import { Neuron } from "./core/NeuralNetwork";


/* Create the global event processing engine for browser related events */
const BrowserEventProcessingEngine = new EventProcessingEngine();

{ // Binding some of the browser global events to the GlobalBrowserEventProcessingEngine
  const OnMouseMoveCallback = BrowserEventProcessingEngine.CreateEvent("OnMouseMove");
  document.addEventListener("mousemove", OnMouseMoveCallback as any, false);
  const OnTouchStartCallback = BrowserEventProcessingEngine.CreateEvent("OnTouchStart");
  document.addEventListener("touchstart", OnTouchStartCallback as any, false);
  const OnTouchMoveCallback = BrowserEventProcessingEngine.CreateEvent("OnTouchMove");
  document.addEventListener("touchmove", OnTouchMoveCallback as any, false);
  const OnWindowResizeCallback = BrowserEventProcessingEngine.CreateEvent("OnWindowResize");
  window.addEventListener("resize", OnWindowResizeCallback as any, false);
  const OnFrameTickCallback = BrowserEventProcessingEngine.CreateEvent("OnFrameTick");
  BrowserEventProcessingEngine.Subscribe("OnFrameTick", null, () => {
    window.requestAnimationFrame(OnFrameTickCallback as any);
  });
  OnFrameTickCallback();
}



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


class DrawnNeuron extends Neuron {
  private Mesh: Three.Mesh;
  constructor(x: number, y: number) {
    super();
    this.Mesh = new Three.Mesh(
      new Three.SphereGeometry( 5, 8, 8 ), 
      new Three.MeshBasicMaterial( {color: 0xFFFFFF} )
    );
    this.Mesh.position.x = x;
    this.Mesh.position.y = y;
  }

  GetMesh(): Three.Mesh {
    return this.Mesh;
  }
};

class Renderer extends Three.WebGLRenderer {
  constructor(private scene: Scene, private camera: Camera) {
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

/**
 * Defines how the user navigates the camera in the world
 * Also currently controls the aspect ratio of the renderer
 */
class NavigationSystem {
  constructor(private scene: Scene, private camera: Camera) {
    this.OnWindowResize(null); // Initial size set-up
    BrowserEventProcessingEngine.Subscribe("OnMouseMove", this, this.OnMouseMove);
    BrowserEventProcessingEngine.Subscribe("OnTouchStart", this, this.OnTouchStart);
    BrowserEventProcessingEngine.Subscribe("OnTouchMove", this, this.OnTouchMove);
    BrowserEventProcessingEngine.Subscribe("OnWindowResize", this, this.OnWindowResize);
    BrowserEventProcessingEngine.Subscribe("OnFrameTick", this, this.OnFrameTick);
  }
  
  OnFrameTick() {
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
    this.WindowHalfWidth = browserDimensions.Width / 2;
    this.WindowHalfHeight = browserDimensions.Height / 2;
    this.camera.aspect = browserDimensions.Width / browserDimensions.Height;
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
  let neuron = new DrawnNeuron(0, 0);
  scene.add(neuron.GetMesh());
  let neuron2 = new DrawnNeuron(50, 30);
  scene.add(neuron2.GetMesh());
  //var light = new Three.AmbientLight(0xffffff);
  //scene.add(light);
  let renderer = new Renderer(scene, camera);
  let navigationSystem = new NavigationSystem(scene, camera);
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);  
})();