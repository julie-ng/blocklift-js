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

const TEXT_FILE = '../test/hello.txt'
const IMAGE_FILE = '../test/image.png'

const lift = new Blocklift({
	account: ACCOUNT,
	accessKey: ACCESS_KEY,
	defaultContainer: 'dev' // must already exist
})

// -- Integration (quick and dirty) --

async function run () {
	const runId = 'run-' + new Date().getMilliseconds() // Date.now()

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

		const newblobPathname = 'local/newblob-' + new Date().getTime() + '.txt'
		const upload1 = await lift.upload(newblobPathname, 'Hello World', { contentType: 'text/plain' })
		logSuccess(`uploaded 'Hello World' text to`, upload1.url)


		await uploadFile(TEXT_FILE, `local/hello-${runId}.txt`)
		await uploadFile(IMAGE_FILE, `local/image-${runId}.png`)

		// const files = [
		// 	newblobPathname,
		// 	`local/hello-${runId}.txt`,
		// 	`local/image-${runId}.png`
		// ]
		// await deleteFiles(files)

		await lift.deleteFile(newblobPathname)
		await lift.deleteFile(`local/hello-${runId}.txt`)
		await lift.deleteFile(`local/image-${runId}.png`)

		console.log('')

	} catch (e) {
		console.log('[ERROR] runId:' + runId)
		console.error(e)
		process.exit(1)
	}
}

run()

// -- Helpers ---

async function uploadFile (sourceFilename, destFilename) {
	const pathname = path.join(__dirname, sourceFilename)
	const upload = await lift.uploadFile(pathname, destFilename)
	logSuccess(`uploaded '` + sourceFilename + `' file to`, upload.url)
}

// async function deleteFiles (filesArray) {
// 	filesArray.forEach(async (f) => {
// 		const d = await lift.deleteFile(f)
// 		logSuccess(`deleted ${f}`)
// 	})
// }

function logSuccess (...params) {
	console.log(chalk.green('✔'), ...params)
}