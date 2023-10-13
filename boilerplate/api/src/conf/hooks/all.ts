import { PsychicConfig, background } from '@rvohealth/psychic'

export default async (psyConf: PsychicConfig) => {
  await background.connect()
}
