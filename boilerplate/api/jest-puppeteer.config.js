module.exports = {
  launch: {
    dumpio: true,
    headless: process.env.BROWSER !== '1',
    args: ['--disable-infobars', '--window-size=1200,800'],
    defaultViewport: null,
  },
  browserContext: 'default',
  server: [
    {
      command: "BROWSER=none PORT=3000 REACT_APP_HOWL_ENV=test yarn --cwd=../client start",
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
      command: 'yarn spec-server',
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
