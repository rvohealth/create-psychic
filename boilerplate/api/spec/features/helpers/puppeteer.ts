import clientConfig from 'conf/client'

export async function visit(uri: string) {
  const conf = await clientConfig()
  await page.goto(`${conf.host}/${uri.replace(/^\//, '')}`)
}
