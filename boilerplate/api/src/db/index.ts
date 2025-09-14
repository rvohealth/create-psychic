import { DbConnectionType, untypedDb } from '@rvoh/dream'
import ApplicationModel from '../app/models/ApplicationModel.js'

export default function db(connectionType: DbConnectionType = 'primary', connectionName: string = 'default') {
  return untypedDb<ApplicationModel>(connectionName, connectionType)
}
