const Blocklift = require('./blocklift')
jest.mock('@azure/storage-blob')

describe ('Blocklift', () => {
	let lift

	beforeEach(() => {
		lift = new Blocklift()
	})

	describe ('methods', () => {
		it ('has a createContainer() method', () => {
			expect(typeof lift.createContainer).toEqual('function')
		})

		it ('has a deleteContainer() method', () => {
			expect(typeof lift.deleteContainer).toEqual('function')
		})

		it ('has a listContainers() method', () => {
			expect(typeof lift.listContainers).toEqual('function')
		})

		it ('has a listBlobs() method', () => {
			expect(typeof lift.listBlobs).toEqual('function')
		})
	})
})