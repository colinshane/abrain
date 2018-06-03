import EventProcessingEngine from "./EventProcessingEngine";

/* Create the global event processing engine for browser related events */
export const BrowserEventProcessingEngine = new EventProcessingEngine();

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