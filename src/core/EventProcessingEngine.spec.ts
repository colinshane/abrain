
import EventProcessingEngine from "./EventProcessingEngine";

import { expect } from 'chai';
import 'mocha';

describe('EventProcessingEngine', () => {

  const processingEngine = new EventProcessingEngine();

  it('should create an event function when creating an event', () => {
    const onEventCallback:Function = processingEngine.CreateEvent("TestEvent");
    expect(onEventCallback).to.be.a("function");
  });

  it('should call only subscribed object with correct arguments and object reference', () => {
    const onEventCallback:Function = processingEngine.CreateEvent("TestEvent2");
    const subscribed_object = {
      "Hello": "World",
      "event_callback": function(arg1:string, arg2:number) {
        expect(arg1).to.equal("hello");
        expect(arg2).to.equal(42);
        expect(this["Hello"]).to.equal("World");
      }
    };
    expect(processingEngine.Subscribe.bind(processingEngine, "TestEvent2", subscribed_object, subscribed_object.event_callback)).not.to.throw();
    onEventCallback("hello", 42);
  });

  it('should not call callback after unsubscribe', () => {
    const onEventCallback:Function = processingEngine.CreateEvent("TestEvent3");
    const subscribed_object = {
      "event_callback": function() {
        expect(false).to.equal(true);
      }
    };
    processingEngine.Subscribe("TestEvent3", subscribed_object, subscribed_object.event_callback);
    processingEngine.Unsubscribe("TestEvent3", subscribed_object);
    onEventCallback();
  });

  it('should throw when (un)subscribing to unknown events', () => {
    expect(processingEngine.Subscribe.bind(this, "AAAAA", this, () => {})).to.throw();
    expect(processingEngine.Unsubscribe.bind(this, "AAAAA", this, () => {})).to.throw();
  });

  it('should throw when re-creating an event', () => {
    expect(processingEngine.CreateEvent.bind("TestEvent")).to.throw();
  });

});
