const BlobOptions = require('./blob-upload-options')

describe ('BlobOptions', () => {
	describe ('Constructor', () => {

		it ('generates expected Azure format', () => {
			const opts = new BlobOptions({ contentType: 'image/png' })
			const result = {
				blobHTTPHeaders: {
					blobContentType: 'image/png'
				}
			}
			expect(opts).toEqual(result)
		})
	})
})
