import * as bodyParser from 'body-parser'

export default async () => {
  return {
    limit: '20kb',
  } as bodyParser.OptionsJson
}
