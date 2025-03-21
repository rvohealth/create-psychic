// TODO: import from shared space. The version within dream contains the most robust variant of snakeify,
// though we don't really use it for anything other than string transformations, so this version has been simplified.
export default function snakeify(str: string): string {
  return str
    .replace(/(?:^|\.?)([A-Z])/g, (_: string, y: string) => '_' + y.toLowerCase())
    .replace(/^_/, '')
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .toLowerCase()
}
