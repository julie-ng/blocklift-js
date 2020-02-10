const BlobHeaders = require('./blob-http-headers')
const util = require('../util')

const VALID_HTTP_HEADERS = [
	'cacheControl',
	'contentDisposition',
	'contentEncoding',
	'contentLanguage',
	'contentMD5',
	'contentType'
]

describe ('BlobHeaders', () => {
	describe ('Constructor', () => {
		let headers

		it ('sets valid properties', () => {
			headers = new BlobHeaders({
				contentType: 'text/plain'
			})
			expect(headers.blobContentType).toEqual('text/plain')
		})

		it ('ignores invalid properties', () => {
			headers = new BlobHeaders({ foo: 'bar' })
			expect(headers.hasOwnProperty('foo')).toEqual(false)
			expect(headers.hasOwnProperty('blobFoo')).toEqual(false)
		})


		it ('prefixed properties with `blob` and with camel case', () => {
			VALID_HTTP_HEADERS.forEach((hdr) => {
				let opts = {}
				opts[hdr] = 'abc123'
				headers = new BlobHeaders(opts)
				let key = 'blob' + util.capitalize(hdr)
				expect(headers.hasOwnProperty(key)).toBe(true)
				expect(headers[key]).toEqual('abc123')
			})
		})
	})
})