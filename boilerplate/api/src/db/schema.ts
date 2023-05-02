import { DateTime } from 'luxon'
import type { ColumnType } from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<DateTime>

export interface DB {}

export const DBColumns = {}
