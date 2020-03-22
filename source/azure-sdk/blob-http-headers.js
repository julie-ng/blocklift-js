const util = require('../util')

const VALID_HTTP_HEADERS = [
	'cacheControl',
	'contentDisposition',
	'contentEncoding',
	'contentLanguage',
	'contentMD5',
	'contentType'
]

/**
 *
 * This wrapper adds the `blob` prefix to standard HTTP Headers, so Azure API accepts them. For reference, see [SDK Docs: Interface BlobHTTPHeaders](https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.2/interfaces/blobhttpheaders.html).
 *
 * @private
 * @prop {String} cacheControl
 * @prop {String} contentDisposition
 * @prop {String} contentEncoding
 * @prop {String} contentLanguage
 * @prop {String} contentMD5
 * @prop {String} contentType
 */
class BlobHeaders {
	constructor (opts = {}) {
		Object.keys(opts).forEach((k) => {
			if (VALID_HTTP_HEADERS.includes(k) && opts[k] !== '') {
				const key = 'blob' + util.capitalize(k)
				this[key] = opts[k]
			}
		})
	}
}

module.exports = BlobHeaders