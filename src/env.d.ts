declare const __BUILD_TIME__: string

interface ImportMetaEnv {
  readonly VITE_SUBSCRIBE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
