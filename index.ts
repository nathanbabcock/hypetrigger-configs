import type Trigger from '../triggers/trigger'
export type Config = {
  id: string,
  title: string,
  exe?: string,
  igdbGameId?: number,
  triggers: Trigger[],
}
