const axios = require('axios')
const path = require('path')
const Blocklift = require('../source/blocklift')

// -- setup --

if (process.env.NODE_ENV === 'development') {
	require('dotenv').config()
}

const env = _setEnvVars([
	'BLOB_ACCOUNT_NAME',
	'BLOB_ACCOUNT_KEY',
	'BLOB_DEFAULT_CONTAINER',
	'BLOB_LIST_CONTAINER',
	'BLOB_LIST_CONTAINER_COUNT'
])

// -- Integration Tests --

describe (`Integration Specs`, () => {

	const runId = _runId()
	const lift = new Blocklift({
		account: env.BLOB_ACCOUNT_NAME,
		accessKey: env.BLOB_ACCOUNT_KEY,
		defaultContainer: env.BLOB_DEFAULT_CONTAINER // must already exist
	})

	describe ('Containers', () => {

		it ('lists containers', async () => {
			const list = await lift.listContainers()
			const containers = []
			list.forEach((c) => containers.push(c.name))
			console.log('containers: ', containers)
			expect(list.length).toBeGreaterThan(0)
		})

		it ('creates a container', async () => {
			const name = 'container-' + runId
			const created = await lift.createContainer(name)
			expect(created.name).toEqual(name)
		})
	})

	describe ('Blobs', () => {
		it ('can list blobs', async () => {
			const blobs = await lift.listBlobs(env.BLOB_LIST_CONTAINER)
			expect(blobs.length).toEqual(env.BLOB_LIST_CONTAINER_COUNT*1)
		})

		it ('can upload content', async () => {
			const newblobPathname = `newblob-${runId}.txt`
			const upload = await lift.upload(newblobPathname, 'Hello World', { contentType: 'text/plain' })
			console.log(upload.url)
			expect(upload.url).not.toEqual('')
		})

		it ('can upload an image', async () => {
			const pathname = path.join(__dirname, '../test/image.png')
			const upload = await lift.uploadFile(pathname, `image-${runId}.png`)
			console.log(upload.url)
			expect(upload.url).not.toEqual('')

			const res = await axios.get(upload.url)
			expect(res.headers['content-type']).toEqual('image/png')
		})

		it ('can upload a text file', async () => {
			const pathname = path.join(__dirname, '../test/hello.txt')
			const upload = await lift.uploadFile(pathname, `hello-${runId}.txt`)
			console.log(upload.url)
			expect(upload.url).not.toEqual('')

			const res = await axios.get(upload.url)
			expect(res.headers['content-type']).toEqual('text/plain')
		})
	})

	describe ('Delete (clean up)', () => {
		it ('can delete containers', async () => {
			const name = 'container-' + runId
			const deleted = await lift.deleteContainer(name)
			expect(deleted.name).toEqual(name)
		})

		it ('can delete blobs', async () => {
			let del1 = await lift.deleteFile(`newblob-${runId}.txt`)
			expect(del1.errorCode).toBe(undefined)

			const del2 = await lift.deleteFile(`hello-${runId}.txt`)
			expect(del2.errorCode).toBe(undefined)

			const del3 = await lift.deleteFile(`image-${runId}.png`)
			expect(del3.errorCode).toBe(undefined)
		})
	})
})

function _runId (prefix = '') {
	const d = new Date()
	return prefix
		+ d.toISOString().slice(0, 10)
		+ '-'
		+ d.getHours()
		+ d.getMinutes()
		+ '-' + Math.random().toString(36).substring(7)
}

function _setEnvVars (names) {
	let hasError = false
	const missing = []
	const vars = {}

	names.forEach((v) => {
		if (process.env[v] === undefined) {
			missing.push(v)
			hasError = true
		} else {
			vars[v] = process.env[v]
		}
	})

	if (hasError) {
		throw `Missing environment variables:\n- ${missing.join('\n- ')}`
	}

	return vars
}