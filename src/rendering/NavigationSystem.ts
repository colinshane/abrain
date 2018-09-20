import { BrowserEventProcessingEngine } from "../core/Globals";
import BrowserUtils from "../utils/BrowserUtils";
import * as Three from 'three';


class Camera extends Three.PerspectiveCamera {
  constructor(SpawningPosition: Three.Vector3) {
    let dimensions = BrowserUtils.GetBrowserDimension();
    super(40, dimensions.Width / dimensions.Height, 1, 15000);
    this.position.x = SpawningPosition.x;
    this.position.y = SpawningPosition.y;
    this.position.z = SpawningPosition.z;
  }
};

interface VelocityState
{
  [index:string] : number,

  forward: number,
  backward: number,
  up: number,
  down: number,
  left: number,
  right: number
}

/**
 * Defines how the user navigates the camera in the world
 * Inspired from https://github.com/mrdoob/three.js/blob/master/examples/js/controls/FlyControls.js
 */
export default class NavigationSystem extends Camera {
  Speed: VelocityState;

  constructor(SpawningPosition: Three.Vector3) {
    super(SpawningPosition);
    for (let i in this.Speed)
    {
      this.Speed[i] = 0;
    }

    this.OnWindowResize(null); // Initial size set-up
    BrowserEventProcessingEngine.Subscribe("OnMouseMove", this, this.OnMouseMove);
    BrowserEventProcessingEngine.Subscribe("OnTouchStart", this, this.OnTouchStart);
    BrowserEventProcessingEngine.Subscribe("OnTouchMove", this, this.OnTouchMove);
    BrowserEventProcessingEngine.Subscribe("OnWindowResize", this, this.OnWindowResize);
    BrowserEventProcessingEngine.Subscribe("OnKeyDown", this, this.OnKeyDown);
    BrowserEventProcessingEngine.Subscribe("OnKeyUp", this, this.OnKeyUp);
    BrowserEventProcessingEngine.Subscribe("OnFrameTick", this, this.OnFrameTick);
  }
  
  OnFrameTick() {
    this.position.x += (this.MouseX - this.position.x) * .05;
    this.position.y += (-this.MouseY + 200 - this.position.y) * .05;
    this.position.z += 0;
    //this.camera.lookAt( this.scene.position );
  }
  OnMouseMove(event: any) {
    this.MouseX = event.clientX - this.WindowHalfWidth;
    this.MouseY = event.clientY - this.WindowHalfHeight;
  }
  OnTouchStart(event: any) {
    if ( event.touches.length > 1 ) {
      event.preventDefault();
      event.stopPropagation();
      this.MouseX = event.touches[ 0 ].pageX - this.WindowHalfWidth;
      this.MouseY = event.touches[ 0 ].pageY - this.WindowHalfHeight;
      switch(event.button) {
        case 0: this.Speed.forward = 1; break;
        case 2: this.Speed.backward = 1; break;
      }
    }
  }
  OnTouchMove(event: any) {
    if ( event.touches.length == 1 ) {
      event.preventDefault();
      this.MouseX = event.touches[ 0 ].pageX - this.WindowHalfWidth;
      this.MouseY = event.touches[ 0 ].pageY - this.WindowHalfHeight;
    }
  }
  OnKeyDown(event: any) {
    switch(event.keyCode) {
			case 87: /*W*/ this.Speed.forward = 1; break;
			case 83: /*S*/ this.Speed.backward = 1; break;

			case 65: /*A*/ this.Speed.left = 1; break;
			case 68: /*D*/ this.Speed.right = 1; break;

			case 82: /*R*/ this.Speed.up = 1; break;
			case 70: /*F*/ this.Speed.down = 1; break;
    }
  }

  OnKeyUp(event: any) {
    switch(event.keyCode) {
			case 87: /*W*/ this.Speed.forward = 0; break;
			case 83: /*S*/ this.Speed.backward = 0; break;

			case 65: /*A*/ this.Speed.left = 0; break;
			case 68: /*D*/ this.Speed.right = 0; break;

			case 82: /*R*/ this.Speed.up = 0; break;
			case 70: /*F*/ this.Speed.down = 0; break;
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
