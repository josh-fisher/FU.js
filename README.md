# FU.js #

FU.js is Yet Another Javascript File Utility Library.

What seperates FU.js from the rest however, is it's implementation of new HTML5 techonologies and it's ability to fail back to older technologies.

Couple this with simple function calls and you get an easy to use, out of the box library that makes loading client files in the browser a snap. 


## Features ##

- Implementation of the following File Loading Mechanisms:
	- XHR
	- FileSystemAPI
	- FileAPI
	- WebWorkers
- Ability to load any type of file.
- Synchronous loading via Web Workers
- Easy initialization and control of the FileSystemAPI
	- Simple Functions for Loading, Saving and Deleting Files/Directories
	- Easy and direct control over Temporary vs Persistant Storage.
	- Simple configuration and initialization.
- Utility Methods to search for files.
- Ability to load partial files (via webkitslice)

## Usage ##

Below are usage examples for a variety of operations.

#### Initialization ####

``` javascript

	FU.LocalRoot = "MyAppName";
	if(FU.CLIENT_FEATURES.FilesystemAPI){
		//Init the local Filesystem
		FU.InitLocalFileSystem(function initialized(){				
			//Now you can use the local filesystem
		});
	}
```


#### Loading ####
Load a remote text file via XHR:

``` javascript

	FU.LoadFile({
		fileType: FU.FILE_TYPE.TXT,
		loadMechanism: FU.LOAD_MECHANISM.XHR,
		remoteURL: "URL/To/Remote/File/",
		loaded: function remoteAssetDataLoaded(data){
			//Do Something with the loaded data.
		}
	});
```
In the above example the URL could also be a chrome FileSystemURL.

Load a remote text file via the File API:

``` javascript

	FU.LoadFile({
		fileType: FU.FILE_TYPE.TXT,
		loadMechanism: FU.LOAD_MECHANISM.FILE,
		file: FileObject,
		loaded: function remoteAssetDataLoaded(data){
			//Do Something with the loaded data.
		}
	});
```
The FileAPI load can only load a file object that is obtained via a drag and drop or FileList.

Load a remote text file via the FileSystemAPI:

``` javascript

	FU.LoadFile({
		fileType: FU.FILE_TYPE.TXT,
		loadMechanism: FU.LOAD_MECHANISM.FILESYSTEM,
		file: FileEntry, // OR localURL
		localURL: LocalFilePath, // OR Filename
		fileName: Filename,
		temporary: false,
		loaded: function remoteAssetDataLoaded(data){
			//Do Something with the loaded data.
		}
	});
```
The FileSystemAPI Load can load based on a file entry, localurl, or filename. You only need to specify one.

``` javascript

	FileUtils.LoadFile({
		fileType: FU.FILE_TYPE.TXT,
		loadMechanism: FU.LOAD_MECHANISM.WEBWORKER,
		remoteURL: url,
		loaded:  function remoteAssetDataLoaded(data){
			//Do Something with the loaded data.
		}
	});
```
In the above example the remote URL could also be a chrome FileSystemURL.



#### Saving ####

``` javascript

	FU.SaveFile({
		remoteAsset: remoteData,
		filePath: LocalFileSystemPath,
		temporary: false,
		saved: function(url){
			console.log(url + " Saved To local Filesystem");
		}
	});
```
The remoteAsset can be text or binary.


#### Other Utilities ####

Searching for local files

``` javascript

	if(FU.CLIENT_FEATURES.FilesystemAPI){
		FU.GetFileFromFilename(fileName, false, function successCallback(fileEntry){
			//Do something with the entry ... Possibly FU.LoadFile()
		});
	}
```

Create a Local Directory

``` javascript

	FU.CreateDirectory(directory, false, function(){
		//Directory create ... do something.
	});
```


## Release Candidates ##

This library is currently in heavy development. As of yet there is not a planned timeframe for the initial release. Consider this code WIP and use it at your discretion.

## License ##

FU.js is available under the MIT and BSD licenses.