module.exports = {
  launch: {
    dumpio: process.env.DEBUG === '1',
    headless: process.env.BROWSER !== '1' ? 'new' : false,
    args: ['--disable-infobars', '--window-size=1200,800', '--disable-extensions'],
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
      launchTimeout: 20000,
      port: 3000,
      usedPortAction: 'kill',
      waitOnScheme: {
        verbose: process.env.DEBUG === '1',
      },
    },
    {
      command: 'ts-node ./src/spec-server.ts',
      host: '127.0.0.1',
      launchTimeout: 20000,
      debug: process.env.DEBUG === '1',
      port: 7778,
      usedPortAction: 'kill',
      waitOnScheme: {
        verbose: process.env.DEBUG === '1',
      },
    },
  ],
}
