# blocklift-js

A dead simple and developer friendly JavaScript library for handling object storage on Azure

[![Build Status](https://travis-ci.org/julie-ng/blocklift-js.svg?branch=master)](https://travis-ci.org/julie-ng/blocklift-js)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4b5bf0e191de7c6c74c8/test_coverage)](https://codeclimate.com/github/julie-ng/blocklift-js/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/4b5bf0e191de7c6c74c8/maintainability)](https://codeclimate.com/github/julie-ng/blocklift-js/maintainability)

## Developer Friendly API

For a simple blob operation, the official [@azure/storage-blob](https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/storage/storage-blob) SDK requires 3 "clients" for the blob service, the container and the blob itself. Blocklift.js abstracts away the complexity to provide a better developer experience.

Note: `UPPERCASE` represents environment variables

```javascript
const Blocklift = require('./blocklift')

const lift = new Blocklift({
	account: ACCOUNT_NAME,
	accessKey: ACCESS_KEY,
	defaultContainer: 'dev' // must already exist
})
			
lift.upload('hello.txt', 'Hello World')
	.then((upload) => { console.log(upload.url) })
	.catch((err) => { … })
```

### Feature: Automatically get Blob URLs

In addition to standard Blob REST API response, blocklift.js also returns a `url` property for you, for example:

```
https://accountname.blob.core.windows.net/dev/hello.txt
```

### Feature: Set a default container

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
// optional container param
lift.upload('hello.txt', 'Hello World', { conatiner: 'not-default' })
```

### Feature: Automatic `Content-Type` detection

Blocklift.js automatically sets a `Content-Type` based on file contents or filename. This helps browsers identify file types and decide how to handle them. You want to show users content as quickly as possible, i.e. in browser and not have them dig through their Downloads folder.

| Content Type | Browser Behavior |
|:--|:--|
| none | browser downloads file (default Azure SDK behavior) |
| `text/plain` | display text in browser |
| `image/jpg` | display image in browser |

Of course other file types are supported including PDFs, Microsoft Word, Powerpoint, Videos, and more. See [file-type](https://www.npmjs.com/package/file-type#supported-file-types) package for detailed list.

### Official SDK Example

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