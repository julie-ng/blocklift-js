const path = require('path')
const util = require('./util')

describe ('Util', () => {
	describe ('capitalize()', () => {
		it ('capitalizes first letter', () => {
			expect(util.capitalize('abc')).toEqual('Abc')
			expect(util.capitalize('helloWorld')).toEqual('HelloWorld')
			expect(util.capitalize('Foo')).toEqual('Foo')
		})
	})

	describe ('getContentTypeFromFile()', () => {
		it ('understands images', async () => {
			const imageFile = path.join(__dirname, '../test/image.png')
			const type = await util.getContentTypeFromFile(imageFile)
			expect(type).toEqual('image/png')
		})

		it ('text files (which file-type lib does not do)', async () => {
			const textFile = path.join(__dirname, '../test/hello.txt')
			const type = await util.getContentTypeFromFile(textFile)
			expect(type).toEqual('text/plain')
		})
	})

	describe ('getFilename()', () => {
		expect(util.getFilename('hello/world.txt')).toEqual('world.txt')
		expect(util.getFilename('foo/bar/cat.md')).toEqual('cat.md')
	})

	describe ('getFileExtension()', () => {
		it ('returns file extention part of string', () => {
			expect(util.getFileExtension('foo.txt')).toEqual('txt')
			expect(util.getFileExtension('hello/world.txt')).toEqual('txt')
			expect(util.getFileExtension('image.jpg')).toEqual('jpg')
			expect(util.getFileExtension('file.test.js')).toEqual('js')
		})
	})
})
