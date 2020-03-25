const AzureSDK = require('./azure-sdk')
const ClientError = require('./client-error')
const util = require('./util')

/**
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
 *
 */
class Blocklift {

	/**
	 * Creates a new Blocklift client for Azure Storage for blobs (binary large objects).
	 *
	 * @param {String} opts.account - Blob Storage Account name
	 * @param {String} opts.accessKey - Blob Storage Account Access Key
 	 * @example
   * const lift = new Blocklift({
   *   account: 'your account name',
   *   accessKey: 'your access key',
   *   defaultContainer: 'your-default-container' // must already exist
   * })
	 */
	constructor (opts = {}) {

		/**
		 * [Azure Storage Account name](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview#naming-storage-accounts) e.g. `mystorageaccount`
		 *
		 * @readonly
		 * @type {String}
		 */
		this.account = opts.account

		/**
		 * Hostname for Azure Storage Account e.g. `https://myaccount.blob.core.windows.net`
		 *
		 * @private
		 * @readonly
		 * @type {String}
		 */
		this.host = `https://${opts.account}.blob.core.windows.net`

		/**
		 * Name of default container for blobs, used if container is not specified in API calls.
		 *
		 * @readonly
		 * @type {String|Object}
		 */
		this.defaultContainer = opts.defaultContainer || null

		/**
		 * Reference to AzureSDK Wrapper
		 *
		 * @private
		 * @readonly
		 * @type {AzureSDK}
		 */
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
	 * @returns {Promise<Array>} list of containers
	 * @returns {Promise<Object>} Error
	 * @example
	 * lift.listContainers()
	 *
	 * @example <caption>Example Response</caption>
   * [
   *   {
   *     name: 'container-1',
   *     properties: {…},
   *     metadata: undefined
   *   },
   *   {
   *     name: 'container-2',
   *     properties: {…},
   *     metadata: undefined
   *   }
   * ]
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
	 * @returns {Promise<Array>} list of blobs
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
	 * @returns {Promise}
	 * @example
	 * lift.upload('hello.txt', 'Hello World', { contentType: 'text/plain' })
	 *
	 * @example <caption>Example reponse</caption>
	 * {
   *   url: 'https://myaccount.blob.core.windows.net/default/hello-2020-03-22.txt',
   *   serverReponse: {
   *     etag: '"0x8D7CE6FCC47FC45"',
   *     lastModified: 2020-03-22T14:46:26.000Z,
   *     contentMD5: <Buffer c4 85 73 58 38 b0 05 75 7f 3f 31 99 50 0c 0e ca>,
   *     clientRequestId: 'd749b9a2-5fba-489d-a230-ba5df662f4f0',
   *     requestId: '283595f3-a01e-0009-1b58-00e0fc000000',
   *     version: '2019-02-02',
   *     date: 2020-03-22T14:46:25.000Z,
   *     isServerEncrypted: true,
   *     encryptionKeySha256: undefined,
   *     errorCode: undefined,
   *     'content-length': '0',
   *     server: 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0',
   *     'x-ms-content-crc64': 'awyymjQimGI=',
   *     body: undefined
   *   }
   * }
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
	 * Upload a file. Blocklift will attempt to set the `Content-Type` for you
	 * based on file extension and/or contents.
	 *
	 * @param {String} sourcePath - source file pathname
	 * @param {String} blobPath - desintation file pathname on Azure
	 * @param {Object} [opts = {}]
	 * @returns {Promise}
	 * @example
	 * lift.uploadFile('local-file.png', 'folder/image.png')
	 *
	 * @example <caption>Example reponse</caption>
	 * {
   *   url: 'https://myaccount.blob.core.windows.net/default/hello-2020-03-22.txt',
   *   serverReponse: {…}
   * }
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
	 * Deletes a Blob from the Storage Account
	 *
	 * @param {String} pathname path to file
	 * @param {Object} [opts]
	 * @param {String} [opts.container] file's container name
	 * @returns {Promise}
	 * @example
	 * lift.deleteBlob('folder/image.png') // uses default container
	 * lift.deleteBlob('folder/image.png', { container: 'my-container' })
	 *
	 * @example <caption>Example Response</caption>
	 * {
   *   name: 'container-2020-03-22-1519-a7uotq',
   *   operation: 'delete',
   *   message: 'Successfully deleted container container-2020-03-22-1519-a7uotq',
   *   serverResponse: {
   *     clientRequestId: '0cf51581-ebbe-4b4c-aaca-4d31bbad1b58',
   *     requestId: '0a6759b4-a01e-0054-0154-00ea78000000',
   *     version: '2019-02-02',
   *     date: 2020-03-22T14:19:55.000Z,
   *     errorCode: undefined,
   *     'content-length': '0',
   *     server: 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0',
   *     body: undefined
   *   }
   * }
	 */
	async deleteBlob (pathname, opts = {}) {
		const params = {
			container: opts.container || this.defaultContainer,
			pathname: pathname
		}
		return this.sdk.deleteBlob(params)
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
