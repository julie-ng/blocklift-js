const AzureSDK = require('./azure-sdk')
const ClientError = require('./client-error')
const util = require('./util')

/**
 * Blocklift
 *
 * ## Syntax of your choice: `async`/`await` or `Promise`
 *
 * Blocklift.js is designed dead simple and will accept either syntax of your choice.
 * Unlike the Azure SDK, Blocklift doesn't care and is bilingual.
 * Just make sure to use and catch errors appropriately.
 *
 * **NOTE** - examples in documentation below do not include either syntax to avoid repetition.
 * It is your responsibility to implement with either Promises or async/await syntax.
 *
 * #### Use with classic `Promise` syntax
 *
 * ```javascript
 * lift.createContainer('name')
 *   .then(res => console.log(res))
 *   .catch(err => console.log(err))
 * ```
 *
 * #### Use with `async`/`await` syntax
 *
 * ```javascript
 * async main () {
 *   try {
 *     const res = await lift.createContainer('name')
 *     console.log(res)
 *   }
 *   catch ((err) => {
 *     console.log(err)
 *   })
 * }
 *
 * main()
 * ```
 *
 * ## Responses
 *
 * The Azure SDK leverages the REST API and server responses are generally passed through to Blocklift. In some cases, the responses are extended to include some handy properities, e.g. URL of uploaded blob.
 *
 * @property {AzureSDK} sdk - SDK wrapper to avoid excessive chaining
 * @property {String} host e.g. `https://myaccount.blob.core.windows.net`
 * @property {String} account Azure Storage Account name
 */
class Blocklift {

	/**
	 * Constructor
	 *
	 * ```javascript
   * const lift = new Blocklift({
   *   account: 'your account name',
   *   accessKey: 'your access key',
   *   defaultContainer: 'your-default-container' // must already exist
   * })
	 * ```
	 *
	 * @param {String} opts.account - Blob Storage Account name
	 * @param {String} opts.accessKey - Blob Storage Account Access Key
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
	 * Will throw an error if name is not all lowercase.
	 *
	 * @param {String} name - will be transformed to lowercase per Azure requirements
	 * @returns {Promise}
	 * @example
	 * lift.createContainer('name')
	 *
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
	 * @example
	 * lift.deleteContainer('name')
	 *
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


	/**
	 * List Containers
	 *
	 * @return {Promise<Array>} list of containers
	 * @return {Promise<Object>} Error
	 * @example
	 * lift.listContainers()
	 *
	 */
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
	 * @example
	 * // list blobs in default container
	 * lift.listBlobs()
	 *
	 * // list blobs in specific container
	 * lift.listBlobs('container')
	 */
	listBlobs (containerName) {
		return this.sdk.listBlobs(containerName)
			.then((res) => res)
			.catch((err) => { throw new ClientError(err) })
	}

	/**
	 * Upload content
	 * at the moment not recommended because it does not include headers
	 * for example `Content-Type`
	 *
	 * @param {String} pathname
	 * @param {String} content
	 * @param {*} [opts={}]
	 *
	 * @example
	 * lift.upload('hello.txt', 'Hello World', { contentType: 'text/plain' })
	 *
	 */
	async upload (pathname, content, opts = {}) {
		if (!pathname) {
			throw 'Error: missing required Blob `pathname` parameter, e.g. `foo.txt` or `foo/bar.txt`'
		}
		const container = opts.container || this.defaultContainer
		const requiredParams = {
			container: container,
			pathname: pathname,
			content: content
		}

		return this.sdk.upload(requiredParams, opts)
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
	 * @example
	 * lift.uploadFile('local-file.png', 'folder/image.png')
	 *
	 */
	async uploadFile (sourcePath, blobPath, opts = {}) {
		const container = opts.container || this.defaultContainer
		const contentType = await util.getContentTypeFromFile(sourcePath)
		const requiredParams = {
			container: container,
			filePathname: sourcePath,
			blobPathname: blobPath,
		}
		opts = {
			...opts,
			contentType: contentType
		}

		return this.sdk.uploadFile(requiredParams, opts)
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

	/**
	 *
	 * @param {String} pathname path to file
	 * @param {Object} [opts]
	 * @param {String} [opts.container] file's container name
	 * @example
	 * lift.deleteFile('folder/image.png') // uses default container
	 * lift.deleteFile('folder/image.png', { container: 'my-container' })
	 *
	 */
	async deleteFile (pathname, opts = {}) {
		const params = {
			container: opts.container || this.defaultContainer,
			pathname: pathname
		}
		return this.sdk.deleteFile(params)
			.then((res) => res)
			.catch((err) => { throw new ClientError(err) })
	}

	/**
	 * Helper that returns URL for a given blob in a given container, e.g. `https://myaccount.blob.core.windows.net/default/my-image.png`
	 *
	 * @param {String} pathname path to file
	 * @param {String} [container] container name
	 * @return {String}
	 * @example
	 * lift.getBlobUrl('my-image.png')
	 *
	 */
	getBlobUrl (pathname, container = '') {
		container = (container === '')
			? this.defaultContainer
			: container
		return this.host + `/${container}/${pathname}`
	}
}


module.exports = Blocklift
