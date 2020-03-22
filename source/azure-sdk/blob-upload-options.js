const BlobHeaders = require('./blob-http-headers')

/**
 * Create options object using Azure format, which expects `blob` prefix and camel case, e.g. `blobContentType` as opposed to `Content-Type`.
 *
 * Example:
 *
 * ```javascript
 * {
 *   blobHTTPHeaders: {
 *     blobContentType: 'text/plain'
 *   }
 * }
 * ```
 *
 * In the future, consider adding `tier` and `metadata` options per [SDK docs](https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.2/interfaces/blockblobuploadoptions.html)
 *
 * @private
 */
class BlobUploadOptions {
	constructor (opts = {}) {
		this['blobHTTPHeaders'] = new BlobHeaders(opts)
	}
}

module.exports = BlobUploadOptions