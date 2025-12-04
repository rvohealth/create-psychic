/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment */

export default async function safelyImportJsonFile(path: string) {
  // node 20 requires us to user "assert"
  // node >22 requires us to user "with"
  // @ts-ignore
  const imported = await import(path, {
    assert: { type: 'json' },
    // @ts-ignore
    with: { type: 'json' },
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return imported
}
