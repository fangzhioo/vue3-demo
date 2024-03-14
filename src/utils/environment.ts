export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

// dev env
export const NODE_ENV = import.meta.env.MODE as NodeEnv

export const isDev = NODE_ENV === NodeEnv.Development
export const isProd = NODE_ENV === NodeEnv.Production
export const isTest = NODE_ENV === NodeEnv.Test

export const PageTitle = import.meta.env.VITE_APP_TITLE
export const API_BASEURL = import.meta.env.VITE_BASE_API || '/api'
export const PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH || ''
