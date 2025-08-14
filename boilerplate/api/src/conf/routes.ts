import { PsychicRouter } from '@rvoh/psychic'
import adminRoutes from './routes.admin.js'

export default function routes(r: PsychicRouter) {
  adminRoutes(r)
  // add routes here, perhaps by running `yarn psy g:resource v1/pets Pet name:citext birthdate:date species:enum:pet_species:dog,cat,fish`
}
