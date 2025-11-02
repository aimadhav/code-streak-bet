/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STELLAR_NETWORK?: string
  readonly VITE_CHALLENGE_CONTRACT_ADDRESS?: string
  readonly VITE_PLATFORM_FEE_ADDRESS?: string
  readonly VITE_LEETCODE_API_URL?: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
