import type { BistroApi } from '@shared/types'
import { demoApi, demoNow } from './demo'

/**
 * Demo mode kicks in when either
 *  - the app is started with VITE_DEMO=1 (see `yarn dev:web`), or
 *  - there is no Electron preload bridge (renderer opened in a plain browser).
 * Otherwise every call goes over IPC to the main process (src/main/lib/pos.ts).
 */
export const isDemo = import.meta.env.VITE_DEMO === '1' || !window.context

export const api: BistroApi = isDemo ? demoApi : window.context!

/** Wall clock for the UI. In demo mode it is pinned to dinner service (8:45 PM) and ticks from there. */
export const now = () => (isDemo ? demoNow() : Date.now())
