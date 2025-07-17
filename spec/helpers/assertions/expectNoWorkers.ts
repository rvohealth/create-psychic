import expectNoFile from '../expectNoFile.js'

export default async function expectNoWorkers() {
  await expectNoFile('howyadoin/src/api/worker.ts')
  await expectNoFile('howyadoin/src/api/conf/workers.ts')
  await expectNoFile('howyadoin/src/api/app/models/ApplicationBackgroundedModel.ts')
  await expectNoFile('howyadoin/src/api/app/services/ApplicationBackgroundedService.ts')
  await expectNoFile('howyadoin/src/api/app/services/ApplicationScheduledService.ts')
}
