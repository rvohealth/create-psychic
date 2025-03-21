## How to contribute to Psychic cli

First, ensure that you have created a database locally in postgres called "howyadoin_test". All tests that run will be provisioning new apps named "howyadoin", and when migrations are run within those apps during spec runs, those apps will all be searching for the "howyadoin_test" db.

In between each test, a hook is run to completely clear all the tables from the howyadoin_test db, which is different from what we normally do for an app. This is because we are testing the blowing away and rebuilding of the same app over and over again.

#### **Did you find a bug?**

- **Do not open up a GitHub issue if the bug is a security vulnerability
  in Dream ORM**, and instead to refer to our [security policy](https://github.com/rvohealth/psychic-cli/SECURITY.md).
- **Search for an existing Issue on our [Issues page](https://github.com/rvohealth/psychic-cli/issues)**, since it is likely your issue was asked by someone else.
- **If you could not find your existing issue, please open [a new one](https://github.com/rvohealth/psychic-cli/issues/new)**. Be sure to include relevant information, including:
  - Package version
  - Node version
  - Postgres version
  - TypeScript version
  - Description of the problem
  - Replicable code example

#### **Patching a bug?**

- Open [a new pull request on Github](https://github.com/rvohealth/psychic-cli/pulls) with the patch.
- Ensure the PR description describes both the problem and solution, with an issue number attached (if relevant).

Thanks so much!

The Psychic team
