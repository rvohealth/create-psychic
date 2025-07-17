import expectFile from '../expectFile.js'

export default async function expectWebsockets() {
  await expectFile('howyadoin/src/api/conf/websockets.ts')
  await expectFile('howyadoin/src/api/utils/ws.ts')
}
