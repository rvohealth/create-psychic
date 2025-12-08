import FeatureSpecExampleBuilder from '../../../src/file-builders/FeatureSpecExampleBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'

describe('FeatureSpecExampleBuilder', () => {
  const baseOptions: NewPsychicAppCliOptions = {
    packageManager: 'yarn',
    workers: false,
    websockets: false,
    client: 'none',
    adminClient: 'none',
    primaryKeyType: 'bigserial',
  }

  describe('.build', () => {
    context('none', () => {
      it('adds client fspec devserver to boilerplate', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions }
        const res = await FeatureSpecExampleBuilder.build(options)

        await expectToMatchFixture('expected-files/spec/features/example-feature-spec/with-none.spec.ts', res)
      })
    })

    context('react', () => {
      it('adds client fspec devserver to boilerplate', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'react' }
        const res = await FeatureSpecExampleBuilder.build(options)

        await expectToMatchFixture(
          'expected-files/spec/features/example-feature-spec/with-react.spec.ts',
          res,
        )
      })
    })
  })
})
