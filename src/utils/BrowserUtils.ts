interface Dimensions {
  Width: number;
  Height: number;
}

namespace BrowserUtils {
  export function GetBrowserDimension(): Dimensions {
    return {
      Width:  window.innerWidth,
      Height: window.innerHeight
    }
  }
}

export default BrowserUtils;