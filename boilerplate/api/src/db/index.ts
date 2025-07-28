import { DbConnectionType, untypedDb } from '@rvoh/dream'
import ApplicationModel from '../app/models/ApplicationModel.js'

export default function db(connectionName: string = 'default', connectionType: DbConnectionType = 'primary') {
  return untypedDb<ApplicationModel>(connectionName, connectionType)
}
