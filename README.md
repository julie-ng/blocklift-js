# blocklift-js

A dead simple and developer friendly JavaScript library for handling object storage on Azure

[![Build Status](https://travis-ci.org/julie-ng/blocklift-js.svg?branch=master)](https://travis-ci.org/julie-ng/blocklift-js)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4b5bf0e191de7c6c74c8/test_coverage)](https://codeclimate.com/github/julie-ng/blocklift-js/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5bf0e191de7c6c74c8/maintainability)](https://codeclimate.com/github/julie-ng/blocklift-js/maintainability)

## Developer Friendly API

For a simple blob operation, the official [@azure/storage-blob](https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/storage/storage-blob) SDK requires 3 "clients" for the blob service, the container and the blob itself. Blocklift.js abstracts away the complexity to provide a better developer experience.

This is a complete example to upload a file in just a few lines:

```javascript
const Blocklift = require('blocklift')

const lift = new Blocklift({
	account: 'accountname',
	accessKey: 'key',
	defaultContainer: 'dev' // optional
})

lift.upload('hello.txt', 'Hello World')
	.then((upload) => { console.log(upload.url) })
	.catch((err) => { … })
```

You can also use the `async/await` syntax:

```javascript
async function main () {
	const blob =  await lift.upload('hello.txt', 'Hello World')
	console.log(blob.url)
}
main()
```

### Easier than the official SDK

Unfortunately the official [@azure/storage-blob](https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/storage/storage-blob) SDK is cumbersome to use. 

Compare the above with this [official example](https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/storage/storage-blob#create-a-blob-by-uploading-data-to), which has been slightly simplified for fairer comparison:

```javascript
const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");
const defaultAzureCredential = new DefaultAzureCredential();
const account = ACCOUNT_NAME;

const blobServiceClient = new BlobServiceClient(
  `https://${ACCOUNT_NAME}.blob.core.windows.net`,
  defaultAzureCredential
);

const content = "Hello world!";
const containerClient = blobServiceClient.getContainerClient('dev');
const blockBlobClient = containerClient.getBlockBlobClient('hello.txt');
blockBlobClient.upload(content, content.length)
	.then((response) => { … })
	.catch((err) => { … })
```

### Automatically get Blob URLs

In addition to standard Blob REST API response, blocklift.js also returns a `url` property for you, for example:

```
https://accountname.blob.core.windows.net/dev/hello.txt
```

### Set a default container

Why repeatedly pass a container parameter or client, when you can just set a default once and then forget about it?

```javascript
const lift = new Blocklift({
	account: ACCOUNT_NAME,
	accessKey: ACCESS_KEY,
	defaultContainer: 'dev' // must already exist
})
```

Of course, you can always choose to use a different container and pass an _optional_ `container` parameter in individual operations:

```javascript
const options = { conatiner: 'not-default' }
lift.upload('hello.txt', 'Hello World', options)
```

### Automatic `Content-Type` detection

Blocklift.js automatically sets a `Content-Type` based on file contents or filename. This helps browsers identify file types and decide how to handle them. You want to show users content as quickly as possible, i.e. in browser and not have them dig through their Downloads folder.

| Content Type | Browser Behavior |
|:--|:--|
| none | browser downloads file (default Azure SDK behavior) |
| `text/plain` | display text in browser |
| `image/jpg` | display image in browser |

Of course other file types are supported including PDFs, Microsoft Word, Powerpoint, Videos, and more. See [file-type](https://www.npmjs.com/package/file-type#supported-file-types) package for detailed list.

## Examples

Everything is a `Promise`. For a better overview, the `then()`, `catch()`, `async`, and `await` have been left out.

For full details, see [the API documentation &rarr;](https://julie-ng.github.io/blocklift-js/)

### Containers

```javascript
lift.listContainers()
lift.createContainer('name')
lift.deleteContainer('name')
```

### Blobs

```javascript
lift.listBlobs('container')
lift.getBlobUrl('my-image.png')
```

Upload a Blob or Create a File

```javascript
lift.upload('hello.txt', 'Hello World', { contentType: 'text/plain' })
lift.uploadFile('local-file.png', 'folder/image.png')
```

Delete a Blob

```javascript
lift.deleteBlob('folder/image.png')
lift.deleteBlob('folder/image.png', { container: 'not-default' })
```

### Responses

Blocklift.js uses the official SDK under the hood and will bubble up the responses. 

For example, `url` is added by blocklift and `serverResponse` is the unaltered response from the SDK.

```
{
  url: 'https://myaccount.blob.core.windows.net/default/hello-2020-03-22.txt',
  serverReponse: {
    etag: '"0x8D7CE6FCC47FC45"',
    lastModified: 2020-03-22T14:46:26.000Z,
    contentMD5: <Buffer c4 85 73 58 38 b0 05 75 7f 3f 31 99 50 0c 0e ca>,
    clientRequestId: 'd749b9a2-5fba-489d-a230-ba5df662f4f0',
    requestId: '283595f3-a01e-0009-1b58-00e0fc000000',
    version: '2019-02-02',
    date: 2020-03-22T14:46:25.000Z,
    isServerEncrypted: true,
    encryptionKeySha256: undefined,
    errorCode: undefined,
    'content-length': '0',
    server: 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0',
    'x-ms-content-crc64': 'awyymjQimGI=',
    body: undefined
  }
}
```

For more examples, see [the API documentation &rarr;](https://julie-ng.github.io/blocklift-js/Blocklift.html)