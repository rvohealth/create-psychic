import DreamCliLoggableText from './loggable/DreamCliLoggableText.js'

export default class DreamCliLogger {
  public log(text: string, { logPrefix, logPrefixColor, logPrefixBgColor }: DreamCliLoggerLogOpts = {}) {
    const loggable = new DreamCliLoggableText(text, {
      logPrefix,
      logPrefixColor: logPrefixColor || 'green',
      logPrefixBgColor,
    })

    loggable.render()
  }

  public logStartProgress(
    text: string,
    { logPrefix = '✺ ┌', logPrefixColor, logPrefixBgColor }: DreamCliLoggerLogOpts = {}
  ) {
    this.log(text, { logPrefix, logPrefixColor, logPrefixBgColor })
  }

  public logContinueProgress(
    text: string,
    { logPrefix = '✺ ├', logPrefixColor, logPrefixBgColor }: DreamCliLoggerLogOpts = {}
  ) {
    this.log(text, { logPrefix, logPrefixColor, logPrefixBgColor })
  }

  public logEndProgress(
    text: string = 'complete',
    { logPrefix = '✺ └', logPrefixColor, logPrefixBgColor }: DreamCliLoggerLogOpts = {}
  ) {
    this.log(text, { logPrefix, logPrefixColor, logPrefixBgColor })
  }
}

export interface DreamCliLoggerLogOpts {
  logPrefix?: string
  logPrefixColor?: DreamCliForegroundColor
  logPrefixBgColor?: DreamCliBgColor
}

export type DreamCliColor = DreamCliForegroundColor | DreamCliBgColor

export type DreamCliForegroundColor =
  | 'black'
  | 'red'
  | 'redBright'
  | 'green'
  | 'greenBright'
  | 'yellow'
  | 'yellowBright'
  | 'blue'
  | 'blueBright'
  | 'magenta'
  | 'magentaBright'
  | 'cyan'
  | 'cyanBright'
  | 'white'
  | 'whiteBright'
  | 'gray'

export type DreamCliBgColor =
  | 'bgBlack'
  | 'bgRed'
  | 'bgRedBright'
  | 'bgGreen'
  | 'bgGreenBright'
  | 'bgYellow'
  | 'bgYellowBright'
  | 'bgBlue'
  | 'bgBlueBright'
  | 'bgMagenta'
  | 'bgMagentaBright'
  | 'bgCyan'
  | 'bgCyanBright'
  | 'bgWhite'
  | 'bgWhiteBright'
