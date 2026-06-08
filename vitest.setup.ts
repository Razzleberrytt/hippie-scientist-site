import '@testing-library/jest-dom'

// Mock canvas prototype methods to prevent JSDOM canvas warnings in a11y/other tests
if (typeof window !== 'undefined') {
  window.HTMLCanvasElement.prototype.getContext = (() => {
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray() }),
      putImageData: () => {},
      createImageData: () => ({}),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      fill: () => {},
      rect: () => {},
      clip: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      arcTo: () => {},
    } as any
  })
}

// Mock window.location navigation to prevent JSDOM navigation error logs
if (typeof window !== 'undefined') {
  const noop = () => {}
  const originalLocation = window.location
  try {
    window.location.assign = noop
    window.location.replace = noop
    window.location.reload = noop
  } catch (e) {
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        ...originalLocation,
        assign: noop,
        replace: noop,
        reload: noop,
      },
    })
  }
}

// Silence React 18.3+ act deprecation warnings and other environment warnings
if (typeof console !== 'undefined') {
  const originalError = console.error
  console.error = (...args: any[]) => {
    const firstArg = args[0]
    if (
      typeof firstArg === 'string' &&
      (firstArg.includes('ReactDOMTestUtils.act') ||
        firstArg.includes('IS_REACT_ACT_ENVIRONMENT') ||
        firstArg.includes('was not wrapped in act') ||
        (firstArg.includes('deprecated') && firstArg.includes('act')))
    ) {
      return
    }
    originalError(...args)
  }

  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const firstArg = args[0]
    if (
      typeof firstArg === 'string' &&
      (firstArg.includes('ReactDOMTestUtils.act') ||
        firstArg.includes('was not wrapped in act') ||
        firstArg.includes('IS_REACT_ACT_ENVIRONMENT'))
    ) {
      return
    }
    originalWarn(...args)
  }
}
