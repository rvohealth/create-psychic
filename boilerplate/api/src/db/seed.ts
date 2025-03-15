import '../conf/loadEnv'

import AppEnv from '../conf/AppEnv.js'

export default async function seed() {
  if (AppEnv.isTest) return
  // seed your db here
}
