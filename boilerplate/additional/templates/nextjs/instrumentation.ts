export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const fn = (await import('./instrumentation-node.mts')).default
    await fn()
  }
}
