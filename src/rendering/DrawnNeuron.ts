import * as Three from 'three';
import { Neuron, Axon } from "../neuralnetwork/Neuron";


export class DrawnAxon extends Axon {
  // TODO 
}

export class DrawnNeuron extends Neuron {
  private Mesh: Three.Mesh;
  constructor(Position: Three.Vector3) {
    super();
    this.Mesh = new Three.Mesh(
      new Three.SphereGeometry( 5, 8, 8 ), 
      new Three.MeshBasicMaterial( {color: 0xFFFFFF} )
    );
    this.Mesh.position.x = Position.x;
    this.Mesh.position.y = Position.y;
    this.Mesh.position.z = Position.z;
  }

  GetMesh(): Three.Mesh {
    return this.Mesh;
  }
};