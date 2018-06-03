import EventProcessingEngine from "../core/EventProcessingEngine";

const NeuronalTickTime = 10; //ms

// Contains the neural events
const NeuralEventProcessingEngine = new EventProcessingEngine();
{
  const OnNeuronTick = NeuralEventProcessingEngine.CreateEvent("OnNeuronTick");
  window.setInterval(OnNeuronTick, NeuronalTickTime); //10ms neural tick to be validated
}

export class Axon {
  TargetNeurons: Neuron[] = [];
  IsExcitatory: boolean = true; // else => inhibits the neurons
  constructor(private SourceNeuron: Neuron) { }
  public OnActionPotential(Voltage: number)
  {
    let voltageDiff = this.IsExcitatory ? Voltage : -Voltage;
    for (let i in this.TargetNeurons)
    {
      this.TargetNeurons[i].OnNeuronExcitate(voltageDiff);
    }
  }
}

export class Neuron {
  /* All voltages are in millis */
  /* Biological values regroupment @ https://neuroelectro.org/ephys_prop/4/ */ 
  constructor(InitialVoltage: number = -70, InitialCurrent: number = 25, InMembraneResistance: number = 50, InMembraneTimeConstant: number = 1000) {
    this.Voltage = InitialVoltage;
    this.Current = InitialCurrent;
    this.MembraneResistance = InMembraneResistance;
    this.MembraneTimeConstant = InMembraneTimeConstant;
    NeuralEventProcessingEngine.Subscribe("OnNeuronTick", this, this.OnNeuronTick);
  }

  OnNeuronTick() {
    if (this.RefractoryPeriodCounter > 0) {
      --this.RefractoryPeriodCounter;
      return;
    }

    /** From the integrate-and-fire model by Louis Lapicque [1907]
     *  dv/dt = (R*I-v)/tau
     *  thus v(t) = R*I-(R*I-V_0)*e^(-t/tau) for constant R & tau
     */
    // Aproximating -> TODO: Double check
    this.Voltage = (this.MembraneResistance * this.Current - this.Voltage) / this.MembraneTimeConstant * NeuronalTickTime + this.Voltage;

    if (this.Voltage >= this.Threshold) {
      this.Voltage = this.ResetVoltage;
      this.RefractoryPeriodCounter = this.RefractoryPeriodLength;
      this.OnActionPotential();
    }
  }

  private OnActionPotential() {
    for (let i in this.Axons)
    {
      this.Axons[i].OnActionPotential(this.DischargeValue);
    }
  }

  public OnNeuronExcitate(Voltage: number) {
    this.Voltage += Voltage;
  }

  public SetCurrent(NewCurrent: number) {
    this.Current = NewCurrent;
  }

  private Voltage: number;
  private Current: number;
  private MembraneResistance: number;
  private MembraneTimeConstant: number; //tau

  private ResetVoltage: number = 0;
  private Threshold: number = -55; //Typical threshold potential
  private RefractoryPeriodLength: number = 2; //2*NeuronalTickTime of refractory period
  private RefractoryPeriodCounter: number = 0;

  private Axons: Axon[] = [];
  private DischargeValue: number = 1; //TODO: Validate number
  
}