export function assertInitialPassportPublish(currentArtist) {
  if (currentArtist?.published) {
    const error = new Error('passport_republish_requires_transaction')
    error.status = 409
    error.code = 'passport_republish_requires_transaction'
    throw error
  }
}
