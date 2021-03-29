import { cache } from '@/util/cache'
import Api from 'src/api/api'
import { describe, it } from '@vue/cli-plugin-unit-jest'

describe('cache.js', () => {
  it('should get transaction', () => {
    Api.gql.getTransactionDetail()
  })
})
