import expectNoFile from '../expectNoFile.js'

export default async function expectNoWebsockets() {
  await expectNoFile('howyadoin/src/api/conf/websockets.ts')
  await expectNoFile('howyadoin/src/api/utils/ws.ts')
}
