import './css/index.css';
import * as Three from 'three';

interface Dimensions {
  width: number;
  height: number;
}

namespace BrowserUtils {
  export function GetBrowserDimension(): Dimensions {
    // Thanks, https://stackoverflow.com/a/1038781
    function getWidth() {
      return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      );
    }
    
    function getHeight() {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      );
    }
    return {
      width: getWidth(),
      height: getHeight()
    }
  }
}

interface TickableObject {
  OnTick: Function;
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

class Renderer extends Three.WebGLRenderer implements TickableObject {
  constructor(private scene: Scene, private camera: Camera) {
    super({antialias: true, alpha: true});
    this.setPixelRatio( window.devicePixelRatio );
    this.setSize( window.innerWidth, window.innerHeight );    
  }
  OnTick() {
    this.render(this.scene, this.camera);
  }
};

class NavigationSystem implements TickableObject {
  constructor(private scene: Scene, private camera: Camera, private renderer: Renderer) {
    document.addEventListener('mousemove', this.OnMouseMove.bind(this), false);
    document.addEventListener('touchstart', this.OnTouchStart.bind(this), false);
    document.addEventListener('touchmove', this.OnTouchMove.bind(this), false);
    window.addEventListener( 'resize', this.OnWindowResize.bind(this), false );
    this.OnWindowResize(null);
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
    let browserDimensions : Dimensions = BrowserUtils.GetBrowserDimension();
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


let TickableObjects: TickableObject[] = [];
function CreateObject<T>(type: new (...args: any[]) => T, ...args: any[]) : T {
  let NewObject: any = new type(...args);
  if (NewObject.OnTick !== undefined) {
    TickableObjects.push(NewObject as TickableObject);
  }
  return NewObject as T;
}

(function main() {
  let camera = CreateObject(Camera);
  let scene = CreateObject(Scene);
  let neuron = CreateObject(Neuron, 0, 0);
  scene.add(neuron);
  let neuron2 = CreateObject(Neuron, 50, 30);
  scene.add(neuron2);
  let renderer = CreateObject(Renderer, scene, camera);
  let navigationSystem = CreateObject(NavigationSystem, scene, camera, renderer);
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);


  // Start rendering every frames
  OnRepaint();
  function OnRepaint() {
    window.requestAnimationFrame(OnRepaint);
    for (let i in TickableObjects) {
      TickableObjects[i].OnTick();
    }
  }
  
})();