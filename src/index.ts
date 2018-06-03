import './css/index.css';
import * as Three from 'three';
import { Neuron } from "./neuralnetwork/Neuron";
import { Scene, WorldRenderer } from "./rendering/WorldRenderer";
import NavigationSystem from "./rendering/NavigationSystem";
import { BrowserEventProcessingEngine } from "./core/Globals";

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


class AudioInput
{
  private Context: AudioContext = new AudioContext();
  private Analyser: AnalyserNode;
  constructor(private BufferSize: number) {
    navigator.mediaDevices.getUserMedia({audio: true})
      .then(this.OnReceiveStream.bind(this))
      .catch(this.OnAudioRequestFailed.bind(this));
  }

  OnTick() {
    let dataArray = new Uint8Array(this.BufferSize);
    this.Analyser.getByteTimeDomainData(dataArray);
    //console.log(dataArray.length);
  }

  private OnReceiveStream(Stream: MediaStream) {
    this.Analyser = this.Context.createAnalyser();
    this.Analyser.fftSize = this.BufferSize;
    
    let microphone = this.Context.createMediaStreamSource(Stream);
    microphone.connect(this.Analyser);
    //let processor = context.createScriptProcessor(1024, nbOfChannels, nbOfChannels);
    this.Analyser.connect(this.Context.destination); //Reoutput audio to speakers

    BrowserEventProcessingEngine.Subscribe("OnFrameTick", this, this.OnTick);
  }

  private OnAudioRequestFailed(Err: string) {
    throw Err;
  }

}


(function main() {
  let navigationSystem = new NavigationSystem(new Three.Vector3(0, 0, 250));
  let scene = new Scene();
  let worldRenderer = new WorldRenderer(scene, navigationSystem);
  
  let neuron = new DrawnNeuron(0, 0);
  scene.add(neuron.GetMesh());
  let neuron2 = new DrawnNeuron(50, 30);
  scene.add(neuron2.GetMesh());
  // let light = new Three.AmbientLight(0xffffff);
  // scene.add(light);
  //let renderer = new Renderer(scene, camera);
  //let navigationSystem = new NavigationSystem(scene, camera);
  document.body.appendChild(worldRenderer.domElement);  

  //new AudioInput(1024);
})();