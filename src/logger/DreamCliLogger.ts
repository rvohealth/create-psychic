import DreamCliLoggable from './loggable/DreamCliLoggable.js'
import DreamCliLoggableSpinner from './loggable/DreamCliLoggableSpinner.js'
import DreamCliLoggableText from './loggable/DreamCliLoggableText.js'

export default class DreamCliLogger {
  private logs: DreamCliLoggable[] = []

  public log<
    IsSpinner extends boolean,
    RetValue extends IsSpinner extends false ? DreamCliLoggableText : DreamCliLoggableSpinner
  >(
    text: string,
    {
      permanent = false,
      spinner = false as IsSpinner,
      logPrefix,
      logPrefixColor,
      logPrefixBgColor,
      spinnerPrefixColor = 'greenBright',
      spinnerPrefixBgColor,
    }: DreamCliLoggerLogOpts<IsSpinner> = {}
  ): RetValue {
    const loggable = spinner
      ? new DreamCliLoggableSpinner({
          text,
          logger: this,
          permanent: false,
          spinner: 'noise',
          color: spinnerPrefixColor,
          bgColor: spinnerPrefixBgColor,
        })
      : new DreamCliLoggableText(text, {
          permanent,
          logPrefix,
          logPrefixColor: logPrefixColor || (permanent ? 'green' : 'yellow'),
          logPrefixBgColor,
        })

    this.logs.push(loggable)

    // re-render everything
    this.render()

    return loggable as RetValue
  }

  public render() {
    this.clear()

    let skipNext = false
    this.logs.forEach(loggable => {
      if (skipNext) {
        skipNext = false
        return
      }

      loggable.render()
    })
  }

  public get spinners() {
    return this.logs.filter(log => log instanceof DreamCliLoggableSpinner)
  }

  /*
   * remove all logs that are not marked permanent,
   * then clear STDOUT and re-render with only
   * the permanent logs remaining.
   */
  public purge() {
    this.logs = this.logs.filter(log => log.permanent)
    this.render()
  }

  public clear() {
    console.clear()
    // @ts-expect-error this works fine with no args provided
    process.stdout.clearLine?.()
    process.stdout.cursorTo?.(0)
  }
}

export interface DreamCliLoggerLogOpts<IsSpinner extends boolean> {
  permanent?: boolean
  spinner?: IsSpinner
  logPrefix?: string
  logPrefixColor?: DreamCliForegroundColor
  logPrefixBgColor?: DreamCliBgColor
  spinnerPrefixColor?: DreamCliForegroundColor
  spinnerPrefixBgColor?: DreamCliBgColor
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
