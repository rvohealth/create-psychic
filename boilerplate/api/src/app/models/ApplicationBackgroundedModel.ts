import { BackgroundJobConfig, BaseBackgroundedModel } from '@rvoh/psychic-workers'
import { DBClass } from '../../types/db.js'
import { connectionTypeConfig, schema } from '../../types/dream.js'
import { globalTypeConfig } from '../../types/dream.globals.js'
import psychicTypes from '../../types/psychic.js'

export default class ApplicationBackgroundedModel extends BaseBackgroundedModel {
  public declare DB: DBClass

  public override get schema() {
    return schema
  }

  public override get connectionTypeConfig() {
    return connectionTypeConfig
  }

  public override get globalTypeConfig() {
    return globalTypeConfig
  }

  public override get psychicTypes() {
    return psychicTypes
  }

  public static override get backgroundJobConfig(): BackgroundJobConfig<BaseBackgroundedModel> {
    return {}
  }
}
