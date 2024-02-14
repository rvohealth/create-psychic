module.exports = {
  launch: {
    dumpio: process.env.DEBUG === '1',
    headless: process.env.BROWSER !== '1' ? 'new' : false,
    args: [
      '--disable-infobars',
      '--window-size=1200,800',
      '--disable-extensions',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--no-sandbox',
    ],
    defaultViewport: null,
    product: 'chrome',
    executablePath: process.env.CHROME_PATH || undefined,
  },
  browserContext: 'default',
  server: [
    {
      command: 'BROWSER=none PORT=3000 REACT_APP_PSYCHIC_ENV=test yarn --cwd=../client start',
      host: '127.0.0.1',
      debug: process.env.DEBUG === '1',
      launchTimeout: 60000,
      port: 3000,
      usedPortAction: 'kill',
      waitOnScheme: {
        verbose: process.env.DEBUG === '1',
      },
    },
    {
      command:
        'APP_ROOT_PATH=$(pwd) TS_SAFE=1 FEATURE_SPEC_RUN=1 npx ts-node --transpile-only ./src/spec-server.ts',
      host: '127.0.0.1',
      launchTimeout:
        (process.env.LAUNCH_TIMEOUT_SECONDS && parseInt(process.env.LAUNCH_TIMEOUT_SECONDS) * 1000) || 60000,
      debug: process.env.DEBUG === '1',
      port: 7778,
      usedPortAction: 'kill',
      waitOnScheme: {
        verbose: process.env.DEBUG === '1',
      },
    },
  ],
}
