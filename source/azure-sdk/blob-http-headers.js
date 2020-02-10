const VALID_HTTP_HEADERS = [
	'cacheControl',
	'contentDisposition',
	'contentEncoding',
	'contentLanguage',
	'contentMD5',
	'contentType'
]

/**
 * Blob Headers wrapper
 *
 * For details, see
 * https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.2/interfaces/blobhttpheaders.html
 */
class BlobHeaders {
	constructor (opts = {}) {
		Object.keys(opts).forEach((k) => {
			if (VALID_HTTP_HEADERS.includes(k) && opts[k] !== '') {
				const key = 'blob' + _capitalize(k)
				this[key] = opts[k]
			}
		})
	}
}

function _capitalize (str) {
	return str[0].toUpperCase() + str.slice(1)
}

module.exports = BlobHeaders