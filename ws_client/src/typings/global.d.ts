/**
 * 往window添加属性
 */
declare global {
  interface Window {
    CESIUM_BASE_URL: string,
    isMobile: boolean
  }
}

export { }