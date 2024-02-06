const SENSITIVE_FIELDS = ['password', 'token', 'authentication', 'authorization', 'secret']

const defaultRequestFilter = {
  maskBody: SENSITIVE_FIELDS,
  maskQuery: SENSITIVE_FIELDS,
  maskHeaders: SENSITIVE_FIELDS,
  maxBodyLength: 500,
}

export function loggerOptions() {
  return {
    request: {
      ...defaultRequestFilter,
      excludeHeaders: [
        'authorization',
        'content-length',
        'connection',
        'cookie',
        'sec-ch-ua',
        'sec-ch-ua-mobile',
        'sec-ch-ua-platform',
        'sec-fetch-dest',
        'sec-fetch-mode',
        'sec-fetch-site',
        'user-agent',
      ],
    },
    response: {
      ...defaultRequestFilter,
      excludeHeaders: ['*'], // Exclude all headers from responses,
      excludeBody: ['*'], // Exclude all body from responses
    },
    excludeURLs: ['/health_check'],
  }
}
