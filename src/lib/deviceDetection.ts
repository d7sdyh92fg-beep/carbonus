/**
 * Device and browser detection utilities for mobile optimization
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  browser: 'safari' | 'chrome' | 'firefox' | 'samsung' | 'other';
  supportsCamera: boolean;
  supportsHEIC: boolean;
}

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent.toLowerCase();
  
  // Device type detection
  const isMobile = /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  
  // Browser detection
  let browser: DeviceInfo['browser'] = 'other';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'safari';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'samsung';
  } else if (/chrome/i.test(ua)) {
    browser = 'chrome';
  } else if (/firefox/i.test(ua)) {
    browser = 'firefox';
  }
  
  // Camera support
  const supportsCamera = !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
  
  // HEIC support (iOS 11+)
  const supportsHEIC = isIOS;
  
  return {
    isMobile,
    isTablet,
    isIOS,
    isAndroid,
    browser,
    supportsCamera,
    supportsHEIC
  };
}

export function getCameraConstraints(deviceInfo: DeviceInfo): MediaStreamConstraints {
  const baseConstraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: 'environment' }
    }
  };
  
  if (!baseConstraints.video || typeof baseConstraints.video === 'boolean') {
    return baseConstraints;
  }
  
  // iOS Safari specific constraints
  if (deviceInfo.isIOS && deviceInfo.browser === 'safari') {
    return {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };
  }
  
  // Android Chrome constraints
  if (deviceInfo.isAndroid && deviceInfo.browser === 'chrome') {
    return {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 }
      }
    };
  }
  
  // Samsung Internet constraints
  if (deviceInfo.browser === 'samsung') {
    return {
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };
  }
  
  // Tablet constraints (usually better cameras)
  if (deviceInfo.isTablet) {
    return {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 2560, min: 1280 },
        height: { ideal: 1440, min: 720 }
      }
    };
  }
  
  // Default mobile constraints
  return {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920, min: 640 },
      height: { ideal: 1080, min: 480 }
    }
  };
}

export function getDeviceSpecificErrorMessage(error: Error, deviceInfo: DeviceInfo): string {
  if (error.name === 'NotAllowedError') {
    if (deviceInfo.isIOS && deviceInfo.browser === 'safari') {
      return 'Kameros prieiga atmesta. Eikite į Nustatymai → Safari → Kamera ir suteikite prieigą.';
    }
    if (deviceInfo.isAndroid) {
      return 'Kameros prieiga atmesta. Patikrinkite programos leidimus įrenginio nustatymuose.';
    }
    return 'Kameros prieiga atmesta. Suteikite leidimą naršyklės nustatymuose.';
  }
  
  if (error.name === 'NotFoundError') {
    if (deviceInfo.isTablet) {
      return 'Kamera nerasta. Patikrinkite, ar planšetėje yra funkcionuojanti kamera.';
    }
    return 'Kamera nerasta. Naudokite failų įkėlimą.';
  }
  
  if (error.name === 'NotReadableError') {
    return 'Kamera šiuo metu naudojama kitos programos. Uždarykite kitas programas ir bandykite dar kartą.';
  }
  
  if (error.name === 'OverconstrainedError') {
    return 'Kameros kokybės nustatymai nepalaikomi. Bandoma su žemesnėmis nuostatomis...';
  }
  
  return 'Nepavyko pasiekti kameros. Naudokite failų įkėlimą.';
}
