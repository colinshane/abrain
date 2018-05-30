interface EventMappedObject
{
  ObjectReference: object,
  EventTriggerCallback: Function
}

export default class EventProcessingEngine
{
  /**
   * Subscribe to an existing event defined by EventName
   * @param EventName The name of the event
   * @param ObjectReference The object subscribing to the event
   * @param EventTriggerCallback The callback called when the event is triggered
   */
  public Subscribe(EventName: string, ObjectReference: object, EventTriggerCallback: Function): void
  {
    let mappedArray = this._EventMapping[EventName];
    if (mappedArray === undefined)
    {
      throw `Unknown event "${EventName}".`;
    }
    mappedArray.push(
      <EventMappedObject>{
        ObjectReference: ObjectReference, 
        EventTriggerCallback: EventTriggerCallback
      }
    );
  }

  /**
   * Unsubscribe to an existing event defined by EventName
   * @param EventName The name of the event
   * @param ObjectReference The object subscribed to the event
   */
  public Unsubscribe(EventName: string, ObjectReference: object): void
  {
    let mappedArray = this._EventMapping[EventName];
    if (mappedArray === undefined)
    {
      throw `Unknown event "${EventName}".`;
    }
    this._EventMapping[EventName] = mappedArray
      .filter((eventMappedObject: EventMappedObject) => eventMappedObject.ObjectReference !== ObjectReference);
  }

  /**
   * Create an event and returns a function that must be called when event is triggered
   * @param EventName The name of the event
   */
  public CreateEvent(EventName: string): Function
  {
    if (this._EventMapping[EventName] !== undefined)
    {
      throw `Event "${EventName}" already exists.`;
    }
    this._EventMapping[EventName] = [];
    return function Callback() {
      for (let i in this._EventMapping[EventName])
      {
        let eventMappedObject: EventMappedObject = this._EventMapping[EventName][i];
        eventMappedObject.EventTriggerCallback.apply(eventMappedObject.ObjectReference, arguments);
      }
    }.bind(this);
  }

  /**
   * Object of "EventName": Array<EventProcessingEngine>
   */
  private _EventMapping: any = {};
}