- [Overview](#overview)
- [Installation](#installation)
- [Psychic CLI](#psychic-cli)
  - [yarn psy help](#psy-help)
  - [yarn psy new](#psy-new)
  - [yarn psy generate](#psy-generate)
    - [yarn psy generate model](#psy-generate-model)
      - [supported attributes](#supported-attributes)
    - [yarn psy generate controller](#psy-generate-controller)
    - [yarn psy generate migration](#psy-generate-migration)
    - [yarn psy generate resource](#psy-generate-resource)
  - [yarn psy dev](#psy-dev)
  - [yarn psy db create](#psy-db-create)
  - [yarn psy db drop](#psy-db-drop)
  - [yarn psy db migrate](#psy-db-migrate)
  - [yarn psy db rollback](#psy-db-rollback)
  - [yarn psy routes](#psy-routes)
  - [yarn psy build](#psy-build)
  - [yarn psy prod](#psy-prod)
  - [yarn psy spec](#psy-spec)
  - [yarn psy console](#psy-console)

# Overview

Psychic is a slim MVC-based nodejs web framework which simply packages together a routing engine (using [expressjs](https://expressjs.com)), an ORM (using [kysely](https://kysely.dev)), a websocket client (using [socket.io](NEED_LINK)), and a redis client (using [redis](NEED_LINK)), and an optional view layer provided by react. The routing engine has been slightly enhanced to provide resourceful routing patterns, and a controller layer is also provided to allow classic routing paradigms expressed in other major monoliths, since this is not provided out of the box by express.

# Quickstart

```bash
# install global cli
yarn global add https://github.com/rvohealth/psychic-cli@latest

# use global cli to create a new app
psy new myapp

cd myapp

# use whichever code editor you like, just need to edit this file to add the username
# used by postgres. This is usually the username used by the computer, or else 'postgres'
vim ./api/.env

DB_USER=<YOUR_POSTGRES_USERNAME>
DB_NAME=howyadoin_development
...

# do the same thing for the .env.test file, which is used to provision your testing environment
vim ./api/.env.test

DB_USER=<YOUR_POSTGRES_USERNAME>
DB_NAME=howyadoin_test
...

cd api
NODE_ENV=development yarn psy db:create
NODE_ENV=test yarn psy db:create

yarn psy g:resource api/v1/users user email:string password:string rvoId:string type:enum:user_types:Internal,External

NODE_ENV=development yarn psy db:migrate
NODE_ENV=test yarn psy db:migrate
```

Once your resource is generated, open conf/routes.ts and add the following:

```ts
  ...
  r.namespace('api', r => {
    r.namespace('v1', r => {
      r.resources('users')
    })
  })
```

Now that we have a backend, let's kick on our webserver and begin writing an app to connect to

```bash
# generate client schema to use within front end
yarn psy g:api

# without REACT=1, the react client will not start up
REACT=1 yarn dev
```

Now, create API bindings to use with your react front end to connect to your new routes

```ts
// add the following to your client app routes:
// client/src/app/config/routes.ts

  app: {
    ...
    v1: {
      users: {
        index: '/api/v1/users',
        create: '/api/v1/users',
        show: '/api/v1/users/:id',
        update: '/api/v1/users/:id',
        destroy: '/api/v1/users/:id',
      },
    },
    ...
  }
```

Add a new api service to use throughout your app:

```ts
// client/src/app/api/users.ts

import routes from '../config/routes'
import { api } from './common'
import { User } from './schema'

export default class UsersAPI {
  static create(opts: Partial<User>) {
    return api.post(routes.api.v1.users.create, { user: opts })
  }

  static show(id: string) {
    return api.post(routes.api.v1.users.show(id))
  }

  static update(id: string, opts: Partial<User>) {
    return api.patch(routes.api.v1.users.show(id), { user: opts })
  }

  static destroy(id: string) {
    return api.patch(routes.api.v1.users.destroy(id))
  }
}
```

# Installation

If you are looking to create a new psy app, you do not actually need to deal directly with this repo. Instead, you can install psy as a [global cli tool](https://github.com/rvohealth/psychic-cli) using the following:

```bash
yarn global add https://github.com/rvohealth/psychic-cli
```

Although the package is called `psychic-cli`, the executable installed to your machine will actually just be called `psy`. This executable can be used to do everything, from generating a new psy app, to running migrations, generating models, controllers, serializers, resources, and [more](#psychic-cli).

The cli repo is a lightweight node script meant to provide basic generative functions, and otherwise simply acts as a puppet master running your yarn scripts for you.

# Psychic CLI

The yarn psy cli exposes the following api:

## psy help

The help command will expose the underlying cli api to you, like so:

```bash
psy help
Usage: psy [options] [command]

Options:
  -h, --help                               display help for command

Commands:
  new [options] <name>                     create a new psy app
  generate:resource|g:resource <name>      create a controller, model, migration, and serializer for a resource
  generate:model|g:model <name>            g:model <name> [...attributes] create a new psy model
  generate:controller|g:controller <name>  g:controller <name> [...methods] create a new psy controller
  generate:migration|g:migration <name>    g:migration <name> create a new psy migration
  dev                                      starts the local dev server
  db                                       starts the local dev server
  db:create                                creates the database
  db:drop                                  drops the database
  db:migrate                               runs migrations
  db:rollback                              rolls back migrations
  routes                                   lists routes
  build                                    builds typescript project
  prod                                     launches production server
  g:migration                              generates a new migration
  spec                                     runs unit and feature specs
  uspec                                    runs unit specs
  fspec                                    runs feature specs
  console                                  starts repl
  c                                        starts repl (alias for console)
  help [command]                           display help for command
```

## psy new

The psy new command will create a new psy app in the current directory, install all package dependencies for both the psy api, as well as the react app, and then print out a helpful message to encourage you along your journey.

```
psy new myapp

# to bootstrap with redis
psy new myapp --redis

# to bootstrap with socket.io
# note: though redis is not required to do this, it is recommended
# so that any redis background jobs can emit to a distributed websocket network
psy new myapp --redis --ws

# to bootstrap using UUIDs for primary keys
psy new myapp --uuids

# to bootstrap without a react app (meaning, an api-only version)
psy new myapp --api
```

Once run, the output will look something like this:

```bash

      ,▄█▄
    ]█▄▄                         ╓█████▌
    ▐██████▄                   ▄█████▓╣█
     ║████████▄,  ,  ,,▄,▄▄▄▓██████╬╬╣╣▌
      ╚███╣██████████▓▓▓▓██████████╩╠╬▓
       ╙█╬╬╬▓███████████████████████▒▓▌
        ╙▓█▓██████████████████████████
         ╚██████▀███████████╩█▓▌▐▓████▄
         '║█████`╣█Γ║████████▄▄φ▓█████▌
          ║█████████████████████▓█████▌
           █████████████▓▓████████████
           ║█████████████████████████
          ]█████████████████████████
         ,▓██████████████████████████
        ▓█████████████████████████████µ
       ▐███████████████████████████████▄▄
       ║█████████████████████████████████╬╬╣▓
   ,╔╦║███████████████████████████████████▓╬╬╣
,≥≥⌠░░░╠▓████████████████████████████████████▓▓
,;=-',▄█████████████████████████████████████████▓



  ██████╗ ███████╗██╗   ██╗ ██████╗██╗  ██╗██╗ ██████╗
  ██╔══██╗██╔════╝╚██╗ ██╔╝██╔════╝██║  ██║██║██╔════╝
  ██████╔╝███████╗ ╚████╔╝ ██║     ███████║██║██║
  ██╔═══╝ ╚════██║  ╚██╔╝  ██║     ██╔══██║██║██║
  ██║     ███████║   ██║   ╚██████╗██║  ██║██║╚██████╗
  ╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝ ╚═════╝




Installing psychic framework to ./chalupatown
Step 1. write boilerplate to chalupatown: Done!
Step 2. build default config files: Done!
Step 3. Install psychic dependencies: Done!
Step 4. Initialize git repository: Done!
Step 5. Build project: Done!

Welcome to Psychic! What fortunes await your futures?
cd into chalupatown to find out!

to create a database,
  $ psy db:create
  $ NODE_ENV=test psy db:create

to migrate a database,
  $ psy db:migrate
  $ NODE_ENV=test psy db:migrate

to rollback a database,
  $ psy db:rollback
  $ NODE_ENV=test psy db:rollback

to drop a database,
  $ psy db:drop
  $ NODE_ENV=test psy db:drop

to create a resource (model, migration, serializer, and controller)
  $ psy g:resource user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

  # NOTE: doing it this way, you will still need to
  # plug the routes manually in your conf/routes.ts file

to create a model
  $ psy g:model user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

to create a migration
  $ psy g:migration create-user-profiles

to start a dev server at localhost:7777,
  $ psy dev

to run unit tests,
  $ psy uspec

to run feature tests,
  $ psy fspec

to run unit tests, and then if they pass, run feature tests,
  $ psy spec

# NOTE: before you get started, be sure to visit your .env and .env.test
# files and make sure they have database credentials set correctly.
# you can see conf/dream.ts to see how those credentials are used.
```

## psy generate

Psychic comes with several powerful generator commands for quickly building out templates for your app.

### psy generate model

The `generate:model` cli command exposes a nice attribute api, allowing you to express the underlying attributes needed for your app. The tool will take the compiled list of attributes and build out a pre-configured model and migration which can then be tuned to your liking.

running the following:

```bash
yarn psy generate:model user email:string password_digest:string type:enum:user_types:Internal,External
```

will generate the following:

```ts
import { DateTime } from 'luxon'
import { Dream, IdType } from '@rvohealth/dream'
import ApplicationModel from './ApplicationModel'
import UserSerializer from '../../../src/app/serializers/UserSerializer'
import { UserTypesEnum } from '../../../src/db/sync'

export default class User extends ApplicationModel {
  public get table() {
    return 'users' as const
  }

  public get serializer() {
    return UserSerializer<any>
  }

  public id: IdType
  public email: string
  public passwordDigest: string
  public type: UserTypesEnum
  public createdAt: DateTime
  public updatedAt: DateTime
}
```

```ts
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('user_types_enum').asEnum(['Internal', 'External']).execute()

  await db.schema
    .createTable('users')
    .addColumn('id', 'bigserial', col => col.primaryKey())
    .addColumn('email', 'varchar(255)')
    .addColumn('password_digest', 'varchar(255)')
    .addColumn('rvoId', 'varchar(255)')
    .addColumn('type', sql`user_types_enum`)
    .addColumn('created_at', 'timestamp', col => col.notNull())
    .addColumn('updated_at', 'timestamp', col => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute()
  await db.schema.dropType('user_types_enum').execute()
}
```

#### Supported attributes

The following attributes are suppported by the generate model api:

```bash
  belongs_to

# data attributes
  bigint
  bigserial
  bit
  boolean
  box
  bytea
  character
  cidr
  circle
  citext
  date
  datetime
  double
  float
  inet
  integer
  interval
  json
  jsonb
  line
  lseg
  macaddr
  macaddr8
  money
  numeric
  path
  pg_lsn
  pg_snapshot
  point
  polygon
  real
  smallint
  smallserial
  serial
  text
  time
  timestamp
  tsquery
  tsvector
  txid_snapshot
  uuid
  xml
```

### psy generate controller

```bash
yarn psy generate:controller users

# to limit the methods included in the boilerplate
yarn psy generate:controller api/v1/users users index create show
```

```ts
import { Params } from '@rvohealth/psychic'
import AuthedController from '../../AuthedController'

export default class ApiV1UsersController extends AuthedController {
  public async create() {}

  public async index() {}

  public async show() {}
}
```

### psy generate migration

```bash
yarn psy generate:migration create-users
```

```ts
// api/src/db/migrations/1680193523953-create-users.ts

import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {}

export async function down(db: Kysely<any>): Promise<void> {}
```

### psy generate resource

Generate resource will generate a controller, model, migration, and serializer automagically populated with the expected fields

```bash
yarn psy generate:resource api/v1/users user email:string password_digest:string
```

```ts
import { Params } from '@rvohealth/psychic'
import AuthedController from '../../AuthedController'
import User from '../../../models/User'

export default class ApiV1UsersController extends AuthedController {
  public async create() {
    //    const user = await User.create(this.userParams)
    //    this.ok(user)
  }

  public async index() {
    //    const users = await User.all()
    //    this.ok(users)
  }

  public async show() {
    //    const user = await User.find(this.params.id)
    //    this.ok(user)
  }

  public async update() {
    //    const user = await User.find(this.params.id)
    //    await user.update(this.userParams)
    //    this.ok(user)
  }

  public async destroy() {
    //    const user = await User.find(this.params.id)
    //    await user.destroy()
    //    this.ok()
  }

  private get userParams() {
    return Params.restrict(this.params, ['email', 'passwordDigest', 'rvoId', 'type'])
  }
}
```

```ts
// api/src/app/models/user.ts

import { DateTime } from 'luxon'
import { Dream, IdType } from '@rvohealth/dream'
import ApplicationModel from './ApplicationModel'
import UserSerializer from '../../../src/app/serializers/UserSerializer'
import { UserTypesEnum } from '../../../src/db/sync'

export default class User extends ApplicationModel {
  public get table() {
    return 'users' as const
  }

  public get serializer() {
    return UserSerializer<any>
  }

  public id: IdType
  public email: string
  public passwordDigest: string
  public rvoId: string
  public type: UserTypesEnum
  public createdAt: DateTime
  public updatedAt: DateTime
}
```

```ts
// api/src/app/serializers/user.ts

import { DreamSerializer, Attribute } from '@rvohealth/dream'
import { UserTypesEnum } from '../../../src/db/sync'
import User from '../models/User'

export default class UserSerializer<DataType extends User> extends DreamSerializer<DataType> {
  @Attribute('string')
  public email: string

  @Attribute('string')
  public passwordDigest: string

  @Attribute('string')
  public rvoId: string

  @Attribute('enum:UserTypesEnum')
  public type: UserTypesEnum
}
```

```ts
// api/src/db/migrations/1680193848621-create-users.ts

import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('user_types_enum').asEnum(['Internal', 'External']).execute()

  await db.schema
    .createTable('users')
    .addColumn('id', 'bigserial', col => col.primaryKey())
    .addColumn('email', 'varchar(255)')
    .addColumn('password_digest', 'varchar(255)')
    .addColumn('rvoId', 'varchar(255)')
    .addColumn('type', sql`user_types_enum`)
    .addColumn('created_at', 'timestamp', col => col.notNull())
    .addColumn('updated_at', 'timestamp', col => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute()
  await db.schema.dropType('user_types_enum').execute()
}
```

## psy dev

Launches a dev server for your api on port `7777`, allowing you to develop and test your api locally

```bash
yarn psy dev

# launch the react app in tandem on port 3000
REACT=1 yarn psy dev
```

## psy db create

Creates a database using the underlyiing kysely cli

```bash
yarn psy db:create

# create test database
NODE_ENV=test yarn psy db:create
```

## psy db drop

Drops a database using the underlyiing kysely cli

```bash
yarn psy db:drop

# drops test database
NODE_ENV=test yarn psy db:drop
```

## psy db migrate

Runs migrations using undelrying kysely cli

```bash
yarn psy db:create

# migrates test database
NODE_ENV=test yarn psy db:create
```

## psy db rollback

Rolls back recent migrations using undelrying kysely cli

```bash
yarn psy db:rollback

# rolls back test database
NODE_ENV=test yarn psy db:rollback
```

## psy routes

Lists all routes exposed by the underlying express app

```bash
yarn psy routes

# output:
GET     ping                ping#ping
GET     /api/v1/users       Api/V1/Users#index
POST    /api/v1/users       Api/V1/Users#create
PUT     /api/v1/users/:id   Api/V1/Users#update
PATCH   /api/v1/users/:id   Api/V1/Users#update
GET     /api/v1/users/:id   Api/V1/Users#show
DELETE  /api/v1/users/:id   Api/V1/Users#destroy
```

## psy build

Runs underlying yarn build command

```bash
yarn psy build
```

## psy prod

Launches production webserver (TODO: implement!)

```bash
yarn psy prod
```

## psy spec

Psychic is built on jest and playwright, facilitating writing end-to-end feature specs that drive through your react app, hitting your backend api (which we call `feature` specs). Comparitively, we have a concept of `unit` specs, which do not excercise the front end and do not use puppeteer, but instead just use jest by itself.

To run all of the specs, you can simply run

```bash
yarn spec
```

which will run unit specs first, and then run feature specs after. If instead, you only want to run unit or feature specs, you can do the following:

```bash
# run unit specs exclusively
yarn uspec

# run feature specs exclusively
yarn fspec
```

### yarn console

The console gives you access to a repl, which automatically side-loads all of your models and exposes them to you globally within the repl. This gives you immediate access to your underlying data models, allowing you to inspect and shape the database to your liking.

```bash
yarn console
> u = await User.first()
User {
  dataValues: {
    id: 1,
    rvoId: 'slkdjhfkldfj',
    createdAt: 2023-03-29T00:05:36.320Z,
    updatedAt: 2023-03-29T00:06:14.624Z
  },
  _previousDataValues: {
    id: 1,
    rvoId: 'slkdjhfkldfj',
    createdAt: 2023-03-29T00:05:36.320Z,
    updatedAt: 2023-03-29T00:06:14.624Z
  },
  uniqno: 1,
  _changed: Set(0) {},
  _options: {
    isNewRecord: false,
    _schema: null,
    _schemaDelimiter: '',
    raw: true,
    attributes: [ 'id', 'rvoId', 'createdAt', 'updatedAt' ]
  },
  isNewRecord: false
}
```

## quick commit

yarn && yarn build && git add --all; git commit -m 'update psy'; git push
