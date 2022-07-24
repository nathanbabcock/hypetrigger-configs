import type Trigger from '../triggers/trigger'
export type Config = {
  id: string
  title: string
  exe?: string
  version?: number
  igdbGameId?: number
  triggers: Trigger[]
}
