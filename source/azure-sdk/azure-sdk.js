const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const BlobUploadOptions = require('./blob-upload-options')

/**
 * Abstracts all the chaining required to use Azure SDK
 * and converts iterables to standard objects
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

	async createContainer (name) {
		return await this.service
			.getContainerClient(name)
			.create()
	}

	async deleteContainer (name) {
		return await this.service
			.getContainerClient(name)
			.delete()
	}

	async listContainers () {
		const containers = []
		const iter = this.service.listContainers()

		for await (const c of iter) {
			containers.push(c)
		}

		return containers
	}

	// ---- Blobs ----

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
	 * https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.2/interfaces/blobhttpheaders.html#blobcontenttype
	 *
	 * @param {String} params.container
	 * @param {String} params.filePathname - pathname of of source file
	 * @param {String} params.blobPathname - pathname for destination blob without container prefix
	 * @param {String} [opts.contentType] - content type
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
	 * @param {String} params.container
	 * @param {String} params.blobPathname - pathname for destination blob without container prefix
	 */
	async deleteFile (params, opts = {}) {
		return this.service
			.getContainerClient(params.container)
			.getBlockBlobClient(params.pathname)
			.delete()
	}
}

module.exports = AzureSDK
