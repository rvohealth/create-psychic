/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export default async function safelyImportJsonFile(path: string) {
  const imported = await import(path, { with: { type: 'json' } })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return imported
}
