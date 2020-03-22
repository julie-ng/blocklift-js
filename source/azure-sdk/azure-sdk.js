const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const BlobUploadOptions = require('./blob-upload-options')

/**
 * **NOTE: this class is documented here, but meant for _internal_ use only.**
 *
 * Abstracts all the chaining required to use Azure SDK
 * and converts iterables to standard objects. For example,
 * as a developer, a single method is easier to understand and therefore preferred:
 *
 * ```javascript
 * // Blocklift API - simple and preferred:
 * service.uploadFile('local-file.png', 'destination.png')
 * ```
 *
 * As a developer, dealing with the internal interfaces is _not_ preferred
 *
 * ```javascript
 * // Azure SDK API - clunky and not preferred
 * service
 *   .getContainerClient('container')
 *   .getBlockBlobClient('destination.png')
 *   .uploadFile('local-file.png')
 * ```
 * @private
 * @prop {String} opts.account - blob storage accout name
 */
class AzureSDK {
	constructor (opts = {}) {
		this.account = opts.account
		this.accountUrl = `https://${opts.account}.blob.core.windows.net`

		const sharedKeyCredential = new StorageSharedKeyCredential(opts.account, opts.accessKey)

		// this.defaultContainer = opts.defaultContainer || null
		this.service = new BlobServiceClient(
			this.accountUrl,
			sharedKeyCredential
		)
	}

	// ---- Containers ----

	/**
	 * @param {String} name - container name
	 * @return {Promise}
	 */
	async createContainer (name) {
		return await this.service
			.getContainerClient(name)
			.create()
	}

	/**
	 * @param {String} name - container name
	 * @return {Promise}
	 */
	async deleteContainer (name) {
		return await this.service
			.getContainerClient(name)
			.delete()
	}

	/**
	 * @return {Promise}
	 */
	async listContainers () {
		const containers = []
		const iter = this.service.listContainers()

		for await (const c of iter) {
			containers.push(c)
		}

		return containers
	}

	// ---- Blobs ----

	/**
	 *
	 * @param {String} container - containername
	 * @return {Array}
	 */
	async listBlobs (container) {
		const blobs = []
		const containerClient = this.service.getContainerClient(container)
		const iter = await containerClient.listBlobsFlat()

		for await (const b of iter) {
			blobs.push(b)
		}

		return blobs
	}

	/**
	 * Uploads Raw Content
	 * Todo: add options, e.g. parallel upload block size
	 *
	 * @param {String} params.container
	 * @param {String} params.pathname - path name for blob without container prefix
	 * @param {String} params.content
	 * @param {String} [opts.contentType] - content type
	 * @return {Promise}
	 */
	async upload (params, opts = {}) {
		const blobOpts = new BlobUploadOptions(opts)

		return this.service
			.getContainerClient(params.container)
			.getBlockBlobClient(params.pathname)
			.upload(params.content, params.content.length, blobOpts)
	}

	/**
	 * Uploads file
	 *
	 * Todo: add options, e.g. parallel upload block size
	 * For more blob upload options see
	 * [official SDK Docs](https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.2/classes/blockblobclient.html#uploadfile).
	 *
	 * @param {String} params.container
	 * @param {String} params.filePathname - pathname of of source file
	 * @param {String} params.blobPathname - pathname for destination blob without container prefix
	 * @param {String} [opts.contentType] - content type
	 * @return {Promise}
	 */
	async uploadFile (params, opts = {}) {
		const blobOpts = new BlobUploadOptions(opts)

		return this.service
			.getContainerClient(params.container)
			.getBlockBlobClient(params.blobPathname)
			.uploadFile(params.filePathname, blobOpts)
	}

	/**
	 * Delete a blob
	 *
	 * @param {String} params.container - container name
	 * @param {String} params.blobPathname - pathname for destination blob without container prefix
	 * @return {Promise}
	 */
	async deleteFile (params, opts = {}) {
		return this.service
			.getContainerClient(params.container)
			.getBlockBlobClient(params.pathname)
			.delete()
	}
}

module.exports = AzureSDK
