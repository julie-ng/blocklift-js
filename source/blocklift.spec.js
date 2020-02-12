const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
jest.mock('@azure/storage-blob')

const Blocklift = require('./blocklift')
const specHelpers = require('./spec.helpers')

describe ('Blocklift.js', () => {
	let lift
	let serviceClient
	let stubIterable

	beforeEach(() => {
		lift = new Blocklift({ account: 'spec' })
		serviceClient = BlobServiceClient.mock.instances[0]
		stubIterable = specHelpers.iterableStub()
	})

	describe ('constructor', () => {
		it ('instantiates `BlobServiceClient` from azure SDK', () => {
			expect(BlobServiceClient.mock.calls.length).toEqual(1)
		})

		it ('instantiates `StorageSharedKeyCredential` from azure SDK', () => {
			expect(StorageSharedKeyCredential.mock.calls.length).toEqual(1)
		})
	})

	describe ('Containers', () => {
		let getContainerClientSpy, sdkSpy

		beforeEach(() => {
			getContainerClientSpy = jest.spyOn(serviceClient, 'getContainerClient')
			sdkSpy = jest.fn()
		})

		afterEach(() => {
			getContainerClientSpy.mockRestore()
		})

		describe ('createContainer()', () => {
			it ('calls `getContainerClient().create()` on SDK', async () => {
				specHelpers.mockContainerClient(serviceClient, { create: sdkSpy })
				await lift.createContainer('test')
				expect(sdkSpy).toHaveBeenCalledTimes(1)
				expect(getContainerClientSpy).toHaveBeenCalledTimes(1)
			})

			it ('throws is name not all lowercase', async () => {
				await expect (() => {
					lift.createContainer('FAIL')
				}).toThrow('Error: invalid container name. Please use all lowercase letters')
			})
		})

		describe ('deleteContainer()', () => {
			it ('calls `getContainerClient().delete()` on SDK', async () => {
				specHelpers.mockContainerClient(serviceClient, { delete: sdkSpy })
				await lift.deleteContainer('test')
				expect(sdkSpy).toHaveBeenCalledTimes(1)
				expect(getContainerClientSpy).toHaveBeenCalledTimes(1)
			})
		})

		describe ('listContainers()', () => {
			let spy

			beforeEach(() => {
				spy = jest.spyOn(serviceClient, 'listContainers')
				serviceClient.listContainers.mockImplementation(() => stubIterable)
			})

			afterEach (() => {
				spy.mockRestore()
			})

			it ('calls `listsContainers()` on SDK', async () => {
				const results = await lift.listContainers()

				expect(Array.isArray(results)).toBe(true)
				expect(results).not.toEqual(stubIterable)
				expect(spy).toHaveBeenCalledTimes(1)
			})
		})
	})

	describe ('Blobs', () => {
		describe ('listBlobs()', () => {
			it ('calls `listBlobsFlat()` on SDK', async () => {
				const listBlobsSpy = jest.fn().mockImplementation((c) => stubIterable)
				specHelpers.mockContainerClient(serviceClient, { listBlobsFlat: listBlobsSpy })

				const blobs = await lift.listBlobs('mycontainer')

				expect(listBlobsSpy).toHaveBeenCalledTimes(1)
				expect(Array.isArray(blobs)).toBe(true)
				expect(blobs).not.toEqual(stubIterable)
			})
		})

		describe ('getBlobUrl()', () => {
			it ('can specify container as param', () => {
				expect(lift.getBlobUrl('hello.txt', 'container'))
					.toEqual('https://spec.blob.core.windows.net/container/hello.txt')

				expect(lift.getBlobUrl('with-subfolder/hello.txt', 'container'))
					.toEqual('https://spec.blob.core.windows.net/container/with-subfolder/hello.txt')
			})

			it ('can use default container', () => {
				let mylift = new Blocklift({
					account: 'test',
					defaultContainer: 'default-container'
				})
				let url = mylift.getBlobUrl('foo/bar.jpg')

				expect(url).toEqual('https://test.blob.core.windows.net/default-container/foo/bar.jpg')
			})
		})
	})

	describe ('Errors - uses friendlier custom errors', () => {
		const err = {
			statusCode: 403,
			code: 'ServerCode',
			message: 'The Blob Service REST endpoint usually returns an error message.'
		}

		it ('listContainers()', () => {
			// TODO: refactor
			serviceClient.listContainers.mockImplementation(() => { throw specHelpers.serverErrorStub(err) })
			expect.assertions(2)
			return lift.listContainers().catch((e) => {
				expect(e.details.statusCode).toEqual(403)
				expect(e.code).toEqual('ServerCode')
			})
		})
	})
})
