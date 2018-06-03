import { BrowserEventProcessingEngine } from "../core/Globals";
import BrowserUtils from "../utils/BrowserUtils";
import * as Three from 'three';


class Camera extends Three.PerspectiveCamera {
  constructor(SpawningPosition: Three.Vector3) {
    super(40, window.innerWidth / window.innerHeight, 1, 15000);
    this.position.x = SpawningPosition.x;
    this.position.y = SpawningPosition.y;
    this.position.z = SpawningPosition.z;
  }
};

/**
 * Defines how the user navigates the camera in the world
 * Also currently controls the aspect ratio of the renderer
 */
export default class NavigationSystem extends Camera {
  constructor(SpawningPosition: Three.Vector3) {
    super(SpawningPosition);
    this.OnWindowResize(null); // Initial size set-up
    BrowserEventProcessingEngine.Subscribe("OnMouseMove", this, this.OnMouseMove);
    BrowserEventProcessingEngine.Subscribe("OnTouchStart", this, this.OnTouchStart);
    BrowserEventProcessingEngine.Subscribe("OnTouchMove", this, this.OnTouchMove);
    BrowserEventProcessingEngine.Subscribe("OnWindowResize", this, this.OnWindowResize);
    BrowserEventProcessingEngine.Subscribe("OnFrameTick", this, this.OnFrameTick);
  }
  
  OnFrameTick() {
    this.position.x += (this.MouseX - this.position.x) * .05;
    this.position.y += (-this.MouseY + 200 - this.position.y) * .05;
    //this.camera.lookAt( this.scene.position );
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
    this.aspect = browserDimensions.Width / browserDimensions.Height;
    this.updateProjectionMatrix();
  }
  MouseX: number = 0;
  MouseY: number = 0;
  WindowHalfWidth: number = 0;
  WindowHalfHeight: number = 0;
}
