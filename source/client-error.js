class ClientError {
	constructor (err) {
		// console.log(err)

		if (err.response) {
			return _serverError(err)
		} else {
			return err
		}
	}
}

// friendlier messages
const friendly = {
	403: 'Please check your credentials.',
	409: 'Cannot create container. Please choose a different name.',
	default: 'Miscellanous error. Debug server response for details.'
}

function _serverError (err) {
	const msg = friendly.hasOwnProperty(err.statusCode)
		? friendly[err.statusCode]
		: friendly.default

	return {
		code: err.response.parsedBody.Code,
		message: msg,
		details: {
			statusCode: err.statusCode,
			response: err.response.parsedBody.message
		}
	}
}

module.exports = ClientError