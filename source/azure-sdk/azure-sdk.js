const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const BlobUploadOptions = require('./blob-upload-options')

/**
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
 *
 * @private
 */
class AzureSDK {

	/**
	 *
	 * @param {Object} opts
	 * @param {String} opts.account
	 */
	constructor (opts = {}) {
		const sharedKeyCredential = new StorageSharedKeyCredential(opts.account, opts.accessKey)

		/**
		 * Azure Storage Account name for reference
		 *
		 * @readonly
		 * @type {String}
		 */
		this.account = opts.account

		/**
		 * Default container name, used if no container is specified when calling the API
		 *
		 * @readonly
		 * @type {String|null}
		 */
		this.defaultContainer = opts.defaultContainer || null

		/**
		 * Reference to [Blob Service Client from Azure SDK](https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.2/classes/blobserviceclient.html)
		 *
		 * @readonly
		 * @type {BlobServiceClient}
		 */
		this.service = new BlobServiceClient(
			`https://${opts.account}.blob.core.windows.net`,
			sharedKeyCredential
		)
	}

	// ---- Containers ----

	/**
	 * @param {String} name - name of container to create
	 * @returns {Promise}
	 */
	async createContainer (name) {
		return await this.service
			.getContainerClient(name)
			.create()
	}

	/**
	 * @param {String} name - name of container to delete
	 * @returns {Promise}
	 */
	async deleteContainer (name) {
		return await this.service
			.getContainerClient(name)
			.delete()
	}

	/**
	 * @returns {Promise<Array>} list of containers
	 * @returns {Promise<Object>} Error
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
