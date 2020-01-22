const stubIterable = function () {
	let stub = {}
	stub[Symbol.iterator] = function* () {
		yield 1
		yield 2
	}
	return stub
}

const serverErrorStub = function (opts = {}) {
	return {
		statusCode: opts.statusCode,
		response: {
			parsedBody:  {
				Code: opts.code || '',
				message: opts.message || ''
			}
		}
	}
}

const mockContainerClient = function (serviceClient, mockFns = {}) {
	serviceClient.getContainerClient.mockImplementation((c) => {
		return {
			create: jest.fn(),
			delete: jest.fn(),
			...mockFns
		}
	})
}

module.exports = {
	iterableStub: stubIterable,
	serverErrorStub: serverErrorStub,
	mockContainerClient: mockContainerClient
}