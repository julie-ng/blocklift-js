const BlobHeaders = require('./blob-http-headers')

/**
 * Block Blob Upload Options
 *
 * Example:
 *
 * ```
 * {
 *   blobHTTPHeaders: {
 * 	   blobContentType: 'text/plain'
 * 	 }
 * }
 * ```
 *
 * In the future, consider adding `tier` and `metadata` options per [SDK docs](https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.2/interfaces/blockblobuploadoptions.html)
 */
class BlobUploadOptions {
	constructor (opts = {}) {
		this['blobHTTPHeaders'] = new BlobHeaders(opts)
	}
}

module.exports = BlobUploadOptions