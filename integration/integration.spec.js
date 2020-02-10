const path = require('path')
const chalk = require('chalk')
const Blocklift = require('../source/blocklift')

// -- setup --

if (process.env.NODE_ENV === 'development') {
	require('dotenv').config()
}

const ACCOUNT = process.env.BLOB_ACCOUNT_NAME
const ACCESS_KEY = process.env.BLOB_ACCOUNT_KEY

if (ACCOUNT === undefined || ACCESS_KEY === undefined) {
	console.log('Error: make sure both `BLOB_ACCOUNT_NAME` and `BLOB_ACCOUNT_KEY` environment variables are set.')
	process.exit(1)
}

const TEST_FILE = '../test/hello.txt'

// -- Integration (quick and dirty) --

async function run () {
	const runId = 'b-' + new Date().getMilliseconds() // Date.now()
	const lift = new Blocklift({
		account: ACCOUNT,
		accessKey: ACCESS_KEY,
		defaultContainer: 'dev' // must already exist
	})

	try {
		console.log('')
		console.log(chalk.underline(`Blocklift.js Integration (run #${runId})`))
		console.log('')

		// containers

		const containersList = await lift.listContainers()
		logSuccess('list Containers: ', containersList.length)

		const created = await lift.createContainer(runId)
		logSuccess('created Container `' + created.name + '`')

		const deleted = await lift.deleteContainer(runId)
		logSuccess('deleted Container `' + deleted.name + '`')

		// blobs

		const blobs = await lift.listBlobs('tests')
		logSuccess('listing Blobs:', blobs.length)

		const newblobPathname = 'newblob-' + new Date().getTime() + '.txt'
		const upload1 = await lift.upload(newblobPathname, 'Hello World')
		logSuccess(`uploaded 'Hello World' text to`, upload1.url)

		const testFilepath = path.join(__dirname, TEST_FILE)
		const destPath = 'local/hello-' + new Date().getTime() + '.txt'
		const upload2 = await lift.uploadFile(testFilepath, destPath)
		logSuccess(`uploaded '` + TEST_FILE + `' file to`, upload2.url)

		console.log('')
	} catch (e) {
		console.log('[ERROR] runId:' + runId)
		console.error(e)
		process.exit(1)
	}
}

run()

// -- Helpers ---

function logSuccess(...params) {
	console.log(chalk.green('✔'), ...params)
}