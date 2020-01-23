const AzureSDK = require('./azure-sdk')
const ClientError = require('./client-error')

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


		this.sdk = new AzureSDK(opts)
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

		return this.sdk.createContainer(name)
			.then((res) => {
				return {
					name: name,
					operation: 'create',
					message: 'Successfully created container ' + name,
					serverResponse: res
				}
			})
			.catch((err) => { throw new ClientError(err) })
	}

	/**
	 * Delete a container
	 *
	 * @param {String} name - container name
	 * @returns {Promise}
	 */
	deleteContainer (name) {
		return this.sdk.deleteContainer(name)
			.then((res) => {
				return {
					name: name,
					operation: 'delete',
					message: 'Successfully deleted container ' + name,
					serverResponse: res
				}
			})
			.catch((err) => { throw new ClientError(err) })
	}

	listContainers () {
		return this.sdk.listContainers()
			.then((res) => res)
			.catch((err) => { throw new ClientError(err) })
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
		return this.sdk.listBlobs(containerName)
			.then((res) => res)
			.catch((err) => { throw new ClientError(err) })
	}

	/**
	 * Upload Blob File
	 *
	 * @param {String} file - path to file
	 * @param {String} [params.container] - container to use
	 * @param {String} params.destination - without container name
	 */
	uploadFile (source, params = {}) {

	}
}

module.exports = Blocklift
