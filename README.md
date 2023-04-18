- [Overview](#overview)
- [Installation](#installation)
- [Howl CLI](#howl-cli)
  - [howl help](#howl-help)
  - [howl new](#howl-new)
  - [howl generate](#howl-generate)
    - [howl generate model](#howl-generate-model)
      - [supported attributes](#supported-attributes)
    - [howl generate controller](#howl-generate-controller)
    - [howl generate migration](#howl-generate-migration)
    - [howl generate resource](#howl-generate-resource)
  - [howl dev](#howl-dev)
  - [howl db create](#howl-db-create)
  - [howl db drop](#howl-db-drop)
  - [howl db migrate](#howl-db-migrate)
  - [howl db rollback](#howl-db-rollback)
  - [howl routes](#howl-routes)
  - [howl build](#howl-build)
  - [howl prod](#howl-prod)
  - [howl spec](#howl-spec)
  - [howl console](#howl-console)

# Overview

Howl is a slim MVC-based nodejs web framework which simply packages together a routing engine (using [expressjs](NEED_LINK)), an ORM (using [sequelize-typescript](NEED_LINK)), a websocket client (using [socket.io](NEED_LINK)), and a redis client (using [redis](NEED_LINK)), and an optional view layer provided by react. The routing engine has been slightly enhanced to provide resourceful routing patterns, and a controller layer is also provided to allow classic routing paradigms expressed in other major monoliths, since this is not provided out of the box by express.

# Installation

If you are looking to create a new howl app, you do not actually need to deal directly with this repo. Instead, you can install howl as a [global cli tool](https://github.com/avocadojesus/howl-cli) using the following:

```bash
yarn global add https://github.com/avocadojesus/howl-cli
```

Although the package is called `howl-cli`, the executable installed to your machine will actually just be called `howl`. This executable can be used to do everything, from generating a new howl app, to running migrations, generating models, controllers, serializers, resources, and [more](#howl-cli).

The cli repo is a lightweight node script meant to provide basic generative functions, and otherwise simply acts as a puppet master running your yarn scripts for you.

# Howl CLI

The howl cli exposes the following api:

## howl help

The help command will expose the underlying cli api to you, like so:

```bash
howl help
Usage: howl [options] [command]

Options:
  -h, --help                               display help for command

Commands:
  new [options] <name>                     create a new howl app
  generate:resource|g:resource <name>      create a controller, model, migration, and serializer for a resource
  generate:model|g:model <name>            g:model <name> [...attributes] create a new howl model
  generate:controller|g:controller <name>  g:controller <name> [...methods] create a new howl controller
  generate:migration|g:migration <name>    g:migration <name> create a new howl migration
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

## howl new

The howl new command will create a new howl app in the current directory, install all package dependencies for both the howl api, as well as the react app, and then print out a helpful message to encourage you along your journey.

```
howl new myapp

# to bootstrap with redis
howl new myapp --redis

# to bootstrap with socket.io
# note: though redis is not required to do this, it is recommended
# so that any redis background jobs can emit to a distributed websocket network
howl new myapp --redis --ws

# to bootstrap using UUIDs for primary keys
howl new myapp --uuids

# to bootstrap without a react app (meaning, an api-only version)
howl new myapp --api
```

Once run, the output will look something like this:

```bash
                  ..:^~~!!~~^:.
             .~?5G##&&&##&&@@&#G5J!:
          ^?G#&@&&&&&&####&@@@@@@@&&GY!.
       .?G&&&###&&&@&&&@@&#BGGB&@@@@@&#BY^
     .J#@&&&#BGGGGBBB&@#BBGPPBB&@@@&&##BBBY^
    !P##@BGGPPGGGGPGBBBPPPPPPPPB######B555PP?.
   JGG&@BPPPPPGGGGGB###PPPPPPPPPGGPPGB##PP5BBY:
  YGGG#BPGPPPPGGGB&##@&GPPPGBG55555555PGBB##B5Y^
 ?BGGGPPGGGGGPGGGGG#@#GGPGPP&P55555555PGP5PPP55Y.
:BPPGGGGGGGGGGGGBGGBGGBBGP~ 5#555555GBBGP5555PPP7
?G5PGGGGGGB####BBBGPP#@&P.  .Y#BBBPPB#&#G5555B#B5.
5G5PPGGGGGB#&&#BGGGPGBBP:     #@@#BBB##&&#GGPG#BP:
5GPPPPPB&#GB###BBGGG&@@B.     G@@@@@&BGG#@#GPB#BP:
J&GPPPPPGBGGGGGGBBGB&&G^      G@@@@@@#BB&@&####B5.
^@&PPPP5PGGGGGGGGBGY!:       .#@@@@@@@@@@@@@@@&B?
 J@#P5PPPGPPGGGGG5^          5@@@@@@@@@@@@@@@&#P:
  P&##GGGG##GPPB@!         .^@@@@@@@@@@@@@@&##G~
   5@@@&#&@&BPG&@?      YP.!:&@@@@@@@@@@@@&##P~
    7&@@@@@&GPPP#P     ^@@~~:B@@@@@@@@@@@&#BJ:
     :Y&@@@@@&&&@@^  :.YBGJ:.~PPGB@@@@@@@&P~
       :J#@@@@#5?7^ ..            Y@@@@&P~
         .~YY~.                   P@#P?:
                                  7~.
:::    :::  ::::::::  :::       ::: :::
:+:    :+: :+:    :+: :+:       :+: :+:
+:+    +:+ +:+    +:+ +:+       +:+ +:+
+#++:++#++ +#+    +:+ +#+  +:+  +#+ +#+
+#+    +#+ +#+    +#+ +#+ +#+#+ +#+ +#+
#+#    #+# #+#    #+#  #+#+# #+#+#  #+#
###    ###  ########    ###   ###   ##########

    to create a database,
      $ howl db:create
      $ NODE_ENV=test howl db:create

    to migrate a database,
      $ howl db:migrate
      $ NODE_ENV=test howl db:migrate

    to rollback a database
      $ howl db:rollback
      $ NODE_ENV=test howl db:rollback

    to drop a database
      $ howl db:drop
      $ NODE_ENV=test howl db:drop

    to create a resource (model, migration, serializer, and controller)
      $ howl g:resource user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

      # NOTE: doing it this way, you will still need to
      # plug the routes manually in your conf/routes.ts file

    to create a model
      $ howl g:model user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

    to create a migration
      $ howl g:migration create-user-profiles

    to start a dev server at localhost:7777,
      $ howl dev

    to run unit tests,
      $ howl uspec

    to run feature tests,
      $ howl fspec

    to run unit tests, and then if they pass, run feature tests,
      $ howl spec

    # NOTE: before you get started, be sure to visit your .env and .env.test
    # files and make sure they have database credentials set correctly.
    # you can see conf/db.js to see how those credentials are used.
```

## howl generate

Howl comes with several powerful generator commands for quickly building out templates for your app.

### howl generate model

The `generate:model` cli command exposes a nice attribute api, allowing you to express the underlying attributes needed for your app. The tool will take the compiled list of attributes and build out a pre-configured model and migration which can then be tuned to your liking.

running the following:

```bash
howl generate:model admin-user email:string password_digest:string last_login_at:datetime
```

will generate the following:

```ts
// api/src/app/models/admin-user.ts

import { Sequelize, DataType, Table, Column, PrimaryKey, AutoIncrement } from 'sequelize-typescript'
import { HowlModel } from 'howl'

@Table({ tableName: 'admin-users', underscored: true })
export default class AdminUser extends HowlModel {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @Column
  public email: string

  @Column
  public passwordDigest: string

  @Column(DataType.DATE)
  public lastLoginAt: Date

  @Column(DataType.DATE)
  public createdAt: Date

  @Column(DataType.DATE)
  public updatedAt: Date
}
```

```ts
// api/src/db/migrations/1680192458872-create-admin-users.ts

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin-users', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
      },
      password_digest: {
        type: Sequelize.STRING,
      },
      last_login_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin-users')
  },
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

### howl generate controller

```bash
howl generate:controller admin-users

# to limit the methods included in the boilerplate
howl generate:controller admin-users index create show
```

```ts
// api/src/app/controllers/admin-users.ts

import { HowlController, Params } from 'howl'

export default class AdminUsersController extends HowlController {
  public async index() {}

  public async create() {}

  public async show() {}
}
```

### howl generate migration

```bash
howl generate:migration create-admin-users
```

```ts
// api/src/db/migrations/1680193523953-create-admin-users.ts

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryinterface, Sequelize) {},

  async down(queryinterface, Sequelize) {},
}
```

### howl generate resource

Generate resource will generate a controller, model, migration, and serializer automagically populated with the expected fields

```bash
howl generate:resource admin-user email:string password_digest:string
```

```ts
// api/src/app/controllers/admin-users.ts

import { HowlController, Params } from 'howl'
import AdminUser from 'app/models/admin-user'

export default class AdminUsersController extends HowlController {
  public async create() {
    const adminUser = await AdminUser.create(this.adminUserParams)
    this.ok(adminUser)
  }

  public async index() {
    const adminUsers = await AdminUser.all()
    this.ok(adminUsers)
  }

  public async show() {
    const adminUser = await AdminUser.findOne({ where: { id: this.params.id } })
    this.ok(adminUser)
  }

  public async update() {
    const adminUser = await AdminUser.findOne({ where: { id: this.params.id } })
    await adminUser.update(this.adminUserParams)
    this.ok(adminUser)
  }

  public async destroy() {
    const adminUser = await AdminUser.findOne({ where: { id: this.params.id } })
    await adminUser.destroy()
    this.ok()
  }

  private get adminUserParams() {
    return Params.restrict(this.params?.adminUser, [
      'id',
      'email',
      'passwordDigest',
      'createdAt',
      'updatedAt',
    ])
  }
}
```

```ts
// api/src/app/models/admin-user.ts

import { Sequelize, DataType, Table, Column, PrimaryKey, AutoIncrement } from 'sequelize-typescript'
import { HowlModel } from 'howl'

@Table({ tableName: 'admin-users', underscored: true })
export default class AdminUser extends HowlModel {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id: number

  @Column
  public email: string

  @Column
  public passwordDigest: string

  @Column(DataType.DATE)
  public createdAt: Date

  @Column(DataType.DATE)
  public updatedAt: Date
}
```

```ts
// api/src/app/serializers/admin-user.ts

import { HowlSerializer } from 'howl'

export default class AdminUserSerializer extends HowlSerializer {
  static {
    this.attributes(
      'id',
      'email',
      'passwordDigest',
      'createdAt',
      'updatedAt',
      'email:string',
      'password_digest:string'
    )
  }
}
```

```ts
// api/src/db/migrations/1680193848621-create-admin-users.ts

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin-users', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
      },
      password_digest: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin-users')
  },
}
```

## howl dev

Launches a dev server for your api on port `7777`, allowing you to develop and test your api locally

```bash
howl dev

# launch the react app in tandem on port 3000
REACT=1 howl dev
```

## howl db create

Creates a database using the underlyiing sequelize cli

```bash
howl db:create

# create test database
NODE_ENV=test howl db:create
```

## howl db drop

Drops a database using the underlyiing sequelize cli

```bash
howl db:drop

# drops test database
NODE_ENV=test howl db:drop
```

## howl db migrate

Runs migrations using undelrying sequelize cli

```bash
howl db:create

# migrates test database
NODE_ENV=test howl db:create
```

## howl db rollback

Rolls back recent migrations using undelrying sequelize cli

```bash
howl db:rollback

# rolls back test database
NODE_ENV=test howl db:rollback
```

## howl routes

Lists all routes exposed by the underlying express app

```bash
howl routes

# output:
POST /login
POST /logout
GET /me
POST /users
GET /users
```

## howl build

Runs underlying yarn build command

```bash
howl build
```

## howl prod

Launches production webserver (TODO: implement!)

```bash
howl prod
```

## howl spec

Howl is built on jest and puppeteer, allowing you to build end-to-end feature specs that drive through your react app, hitting your backend api (which we call `feature` specs). Comparitively, we have a concept of `unit` specs, which do not excercise the front end and do not use puppeteer, but instead just use jest by itself.

To run all of the specs, you can simply run

```bash
howl spec
```

which will run unit specs first, and then run feature specs after. If instead, you only want to run unit or feature specs, you can do the following:

```bash
# run unit specs exclusively
howl uspec

# run feature specs exclusively
howl fspec
```

### howl console

The console gives you access to a repl, which automatically side-loads all of your models and exposes them to you globally within the repl. This gives you immediate access to your underlying data models, allowing you to inspect and shape the database to your liking.

```bash
howl console
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

yarn && yarn build && git add --all; git commit -m 'update howl'; git push
