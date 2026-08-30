import { describe, expect, it } from 'vitest'
import { GoogleIdentityAuth } from './googleIdentity'

describe('GoogleIdentityAuth', () => {
  it('rejects an invalid public client ID before loading Google', async () => {
    const auth = new GoogleIdentityAuth('not-a-google-client', [])
    await expect(auth.connect()).rejects.toThrow('valid Google public OAuth client ID')
  })
})
