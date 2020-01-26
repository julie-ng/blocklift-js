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
		this.host = `https://${opts.account}.blob.core.windows.net`

		this.defaultContainer = opts.defaultContainer || null

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
	 * Upload content
	 * at the moment not recommended because it does not include headers
	 * for example content-type
	 *
	 * @param {String} pathname
	 * @param {String} content
	 * @param {*} [opts={}]
	 */
	upload (pathname, content, opts = {}) {
		if (!pathname) {
			throw 'Error: missing required Blob `pathname` parameter, e.g. `foo.txt` or `foo/bar.txt`'
		}
		const container = opts.container || this.defaultContainer
		const uploadOpts = {
			container: container,
			pathname: pathname,
			content: content
		}

		return this.sdk.upload(uploadOpts)
			.then((res) => {
				return {
					url: this.getBlobUrl(pathname, container),
					serverReponse: res
				}
			})
			.catch((err) => {
				throw new ClientError(err)
			})
	}

	/**
	 *
	 * @param {String} sourcePath - source file pathname
	 * @param {String} blobPath - desintation file pathname on Azure
	 * @param {Object} [opts = {}]
	 */
	uploadFile (sourcePath, blobPath, opts = {}) {
		const container = opts.container || this.defaultContainer
		const uploadOpts = {
			container: container,
			filePathname: sourcePath,
			blobPathname: blobPath
		}
		return this.sdk.uploadFile(uploadOpts)
			.then((res) => {
				return {
					url: this.getBlobUrl(blobPath, container),
					serverReponse: res
				}
			})
			.catch((err) => {
				throw new ClientError(err)
			})
	}

	getBlobUrl (pathname, container = '') {
		container = (container === '')
			? this.defaultContainer
			: container
		return this.host + `/${container}/${pathname}`
	}
}

module.exports = Blocklift
