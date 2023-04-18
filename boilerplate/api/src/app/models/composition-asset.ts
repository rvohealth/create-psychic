import { AfterDestroy, BeforeDestroy, BeforeSave, BelongsTo, Column, HasMany, HasOne, dream } from 'psychic'
import Composition from './composition'
import CompositionAssetAudit from './composition-asset-audit'
import User from './user'

const Dream = dream('composition_assets')
export default class CompositionAsset extends Dream {
  @Column('number')
  public id: number

  @Column('number')
  public composition_id: number

  @Column('string')
  public src: string | null

  @BelongsTo('compositions', () => Composition)
  public composition: Composition

  @HasOne('users', () => User, {
    through: 'composition',
    throughClass: () => Composition,
  })
  public user: User

  @HasMany('composition_asset_audits', () => CompositionAssetAudit)
  public compositionAssetAudits: CompositionAssetAudit[]

  @BeforeSave()
  public ensureDefaultSrc() {
    this.src ||= 'default src'
  }

  @BeforeDestroy()
  public async updateCompositionContentBeforeDestroy(this: CompositionAsset) {
    if (!this.composition) await this.load('composition')
    if (this.src === 'mark before destroy')
      await this.composition!.update({ content: 'something was destroyed' })
  }

  @AfterDestroy()
  public async updateCompositionContentAfterDestroy(this: CompositionAsset) {
    if (!this.composition) await this.load('composition')
    if (this.src === 'mark after destroy')
      await this.composition!.update({ content: 'changed after destroying composition asset' })
  }
}
