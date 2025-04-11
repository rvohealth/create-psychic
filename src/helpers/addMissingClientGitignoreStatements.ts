import * as fs from 'node:fs'

export default function addMissingClientGitignoreStatements(gitignorePath: string) {
  const gitignoreContents = fs.readFileSync(gitignorePath)
  fs.writeFileSync(
    gitignorePath,
    `\
${gitignoreContents}

# yarn
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions`
  )
}
