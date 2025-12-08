import { importExtensions } from './newPsychicApp.js'

export default function rewriteEsmImports(
  fileContents: string,
  importExtension: (typeof importExtensions)[number],
) {
  return fileContents
    .replace(/(from '[^\n]*).js'\n/g, '$1' + suffix(importExtension) + "'\n")
    .replace(/(import '[^']*).js'/g, '$1' + suffix(importExtension) + "'")
}

function suffix(importExtension: (typeof importExtensions)[number]) {
  switch (importExtension) {
    case '.js':
      return '.js'
    case '.ts':
      return '.ts'
    case 'none':
      return ''
  }
}
