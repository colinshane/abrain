interface Dimensions {
  width: number;
  height: number;
}

namespace BrowserUtils {
  export function GetBrowserDimension(): Dimensions {
    return {
      width:  window.innerWidth,
      height: window.innerHeight
    }
  }
}

export default BrowserUtils;