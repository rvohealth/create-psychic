import {
  DataType,
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  BeforeUpdate,
  BeforeCreate,
  Contains,
} from 'sequelize-typescript'
import { Hash, HowlModel } from 'howl'

@Table({ tableName: 'users', underscored: true })
export default class User extends HowlModel {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @Contains('@')
  @Column(DataType.TEXT)
  public email: string

  @Column(DataType.TEXT)
  public passwordDigest: string

  @Column(DataType.VIRTUAL)
  public password: string

  @Column(DataType.DATE)
  public createdAt: Date

  @Column(DataType.DATE)
  public updatedAt: Date

  @BeforeCreate
  @BeforeUpdate
  public static async hashPass(user: User) {
    if (user.password) user.passwordDigest = await Hash.gen(user.password)
    user.password = undefined
  }

  public async checkPassword(password: string) {
    if (!this.passwordDigest) return false
    return await Hash.check(password, this.passwordDigest)
  }
}
