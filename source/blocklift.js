const BlobServiceClient = require("@azure/storage-blob").BlobServiceClient
const StorageSharedKeyCredential = require("@azure/storage-blob").StorageSharedKeyCredential

const Error = require('./error')

/**
 * Blocklift
 *
 * @property {BlockServiceClient} - blockServiceClient
 * @property {}
 */
class Blocklift {

	/**
	 * Constructor
	 *
	 * @param {String} opts.account
	 * @param {String} opts.accessKey
	 */
	constructor (opts = {}) {
		this.account = opts.account
		this.accountUrl = `https://${opts.account}.blob.core.windows.net`

		const sharedKeyCredential = new StorageSharedKeyCredential(opts.account, opts.accessKey)

		this.blobService = new BlobServiceClient(
			this.accountUrl,
			sharedKeyCredential
		)
	}

	// -------- Containers --------

	/**
	 * Creates a new container
	 *
	 * @param {String} name - will be transformed to lowercase per Azure requirements
	 * @returns {Promise}
	 */
	createContainer (name) {
		if (name.toLowerCase() !== name) {
			throw `Error: invalid container name. Please use all lowercase letters`
		}

		return _createContainer(name, this.blobService)
			.then((res) => {
				return {
					name: name,
					operation: 'create',
					message: 'Successfully created container ' + name,
					serverResponse: res
				}
			})
			.catch((err) => { throw new Error(err) })
	}

	/**
	 * Delete a container
	 *
	 * @param {String} name - container name
	 * @returns {Promise}
	 */
	deleteContainer (name) {
		return _deleteContainer(name, this.blobService)
			.then((res) => {
				return {
					name: name,
					operation: 'delete',
					message: 'Successfully deleted container ' + name,
					serverResponse: res
				}
			})
			.catch((err) => { throw new Error(err) })
	}

	listContainers () {
		return _listContainers(this.blobService)
			.then((res) => res)
			.catch((err) => { throw new Error(err) })
	}

	// -------- Blobs --------

	/**
	 * List Blobs in a container or `defaultContainer` if none is provided.
	 *
	 * @param {String} [containerName]
	 * @return {Promise<Array>} list of blobs
	 * @return {Promise<Object>} Error
	 */
	listBlobs (containerName) {
		return _listBlobs(containerName, this.blobService)
			.then((res) => res)
			.catch((err) => { throw new Error(err) })
	}

	/**
	 * Upload Blob File
	 *
	 * @param {String} file - path to file
	 * @param {String} [params.container]
	 * @param {String} params.destination - without container name
	 * @param {*} [params.data]
	 */
	uploadFile (source, params = {}) {
	}
}

// ---- Prefer Promises to Iterators ----

async function _createContainer (name, blobService) {
	return await blobService
		.getContainerClient(name)
		.create()
}

async function _deleteContainer (name, blobService) {
	return await blobService
		.getContainerClient(name)
		.delete()
}

async function _listContainers (blobService) {
	const containers = []
	const iter = blobService.listContainers()

	for await (const c of iter) {
		containers.push(c)
	}

	return containers
}

async function _listBlobs (container, blobService) {
	const blobs = []
	const containerClient = blobService.getContainerClient(container)
	const iter = await containerClient.listBlobsFlat()

  for await (const b of iter) {
    blobs.push(b)
	}

	return blobs
}

module.exports = Blocklift
