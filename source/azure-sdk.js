const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')

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
	 * Todo: add options
	 *
	 * @param {String} opts.container
	 * @param {String} opts.pathname - path name for blob without container prefix
	 * @param {String} opts.content
	 */
	async upload (opts = {}) {
		const container = opts.container || ''
		const pathname = opts.pathname || ''
		const content = opts.content || ''

		return this.service
			.getContainerClient(container)
			.getBlockBlobClient(pathname)
			.upload(content, content.length)
	}
}

module.exports = AzureSDK
