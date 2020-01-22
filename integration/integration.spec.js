if (process.env.NODE_ENV === 'development') {
	require('dotenv').config()
}

const Blocklift = require('../source/blocklift')

const ACCOUNT = process.env.BLOB_ACCOUNT_NAME
const ACCESS_KEY = process.env.BLOB_ACCOUNT_KEY

async function run () {
	const runId = 'b-' + new Date().getMilliseconds() // Date.now()
	const lift = new Blocklift({
		account: ACCOUNT,
		accessKey: ACCESS_KEY
	})

	try {
		console.log(`--- Blocklift.js Integration, Run #${runId} ---`)

		const created = await lift.createContainer(runId)
		console.log('Created Container:', created)

		const deleted = await lift.deleteContainer(runId)
		console.log('Deleted Container:', deleted)

		const blobs = await lift.listBlobs('tests')
		console.log('Listing Blobs:', blobs)
	} catch (e) {
		console.log('[ERROR] runId:' + runId)
		console.error(e)
		process.exit(1)
	}
}

run()
