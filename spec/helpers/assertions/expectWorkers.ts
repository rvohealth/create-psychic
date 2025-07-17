import expectFile from '../expectFile.js'

export default async function expectWorkers() {
  await expectFile('howyadoin/src/api/worker.ts')
  await expectFile('howyadoin/src/api/conf/workers.ts')
  await expectFile('howyadoin/src/api/app/models/ApplicationBackgroundedModel.ts')
  await expectFile('howyadoin/src/api/app/services/ApplicationBackgroundedService.ts')
  await expectFile('howyadoin/src/api/app/services/ApplicationScheduledService.ts')
}
