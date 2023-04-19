import { PsychicRouter } from 'psychic'

export default (r: PsychicRouter) => {
  r.get('ping', 'ping#ping')
}
