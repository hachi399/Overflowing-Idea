/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  // VITE_ で始まらない環境変数は Vite では自動公開されません。
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
