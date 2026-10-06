import { vi } from 'vitest'

const LEAFLET_DOUBLE_CLICK_WINDOW_MS = 250

export function stubMapSize() {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
}

export function waitOutDoubleClickWindow() {
  return new Promise((resolve) => setTimeout(resolve, LEAFLET_DOUBLE_CLICK_WINDOW_MS))
}
