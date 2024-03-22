import { PsychicConfig, background } from '@rvohealth/psychic'

export default async (psyConf: PsychicConfig) => {
  // uncomment if you are using redis, and want to use the background job system
  // await background.connect()
}
