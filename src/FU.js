/**
 * @author JFisher
 */

/**
 * @name FU.js
 */
(function( FU, undefined ) {
	
	/**********************************************************************************************************************
	 * Public Constant Data
	 **********************************************************************************************************************/
	
	FU.LOAD_MECHANISM = {
		FILE: "file",
		FILESYSTEM: "filesystem",
		XHR: "xhr",
		WEBWORKER: "webworker",
	};
	
	FU.FILE_TYPE = {
		TXT: "txt",
		BINARY: "binary",
	}
	
	FU.CLIENT_FEATURES = {
		Workers: false,
		InlineWorkers: false,
		FilesystemAPI: false,
		FileAPI: false,
		XHR: false
	}
	
	//Client Feature Check
	if(window.Worker)
		FU.CLIENT_FEATURES.Workers = true;
		
	if(window.Worker
		&& (window.MozBlobBuilder || window.WebKitBlobBuilder)
		&& (window.webkitURL || window.URL))
	{
		window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder;
		FU.CLIENT_FEATURES.InlineWorkers = true;
	}
		
	if(window.File && window.FileReader && window.FileList && window.Blob)
		FU.CLIENT_FEATURES.FileAPI = true;
	
	if((window.requestFileSystem || window.webkitRequestFileSystem) 
		&& (window.MozBlobBuilder || window.WebKitBlobBuilder)
		&& (window.webkitURL || window.URL))
	{
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder;
		FU.CLIENT_FEATURES.FilesystemAPI = true;
	}

	if(window.XMLHttpRequest)
		FU.CLIENT_FEATURES.XHR = true;
			
	
	/**********************************************************************************************************************
	 * Public Properties
	 **********************************************************************************************************************/
	
	FU.FileSystem = undefined;
	FU.TempFileSystem = undefined;
	FU.LocalRoot = undefined;
	FU.PersistantSize = 10 * 1000 * 1000;
	FU.TemporarySize = 10 * 1000 * 1000;
	

	/**********************************************************************************************************************
	 * Initialization
	 **********************************************************************************************************************/
	
	/*
	 * Init Local FileSystem
	 */
	FU.InitLocalFileSystem = function(callback){
		function onInitFs(fs){
			FU.FileSystem = fs;

		    FU.CreateDirectory("", false, callback);
		}
		
		function onInitTempFs(fs){
			FU.TempFileSystem = fs;

		    FU.CreateDirectory("", true, function(){});
		}
		
		window.webkitStorageInfo.requestQuota(PERSISTENT, FU.PersistantSize, function(grantedBytes) {
			window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
		}, function(e) {
			console.log('Error', e);
		});
		
		window.webkitStorageInfo.requestQuota(window.TEMPORARY, FU.TemporarySize, function(grantedBytes) {
			window.requestFileSystem(window.TEMPORARY, grantedBytes, onInitTempFs, errorHandler);
		}, function(e) {
			console.log('Error', e);
		});
	};
	
	/**********************************************************************************************************************
	 * File System Error Handling
	 **********************************************************************************************************************/
	function errorHandler(e) {
	  var msg = '';
	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };
	  console.log('Error: ' + msg);
	}
	
	/**********************************************************************************************************************
	* Default Event Handlers
	***********************************************************************************************************************/
	
	function Loaded(name){
		console.log("File Loaded: " + name);
	}
	
	function Saved(localURL){
		console.log("File Saved To Local FileSystem: " + localURL)
	}
	
	function NotSupported(name){
		console.log("File: " + name + " Could not load. Type Not Supported.");
	}
	
	function OnError(evt){
		console.log("There was an error reading the file");
	}
	
	function OnProgress(evt){
		
	}
	
	function OnAbort(evt){
		
	}
	
	function FileReader_OnError(evt){
		console.log("There was an error reading the file");
	}
	
	function FileReader_OnProgress(evt){
		console.log("File Read Progress Update!!");
	}
	
	function FileReader_OnAbort(){
		console.log("file Read Cancelled by User");
	}
	
	function FileWriter_OnError(evt){
		console.log("There was an error writing the file");
	}
	
	function FileWriter_OnProgress(evt){
		console.log("File Save Progress Update!!");
	}
	
	function FileWriter_OnAbort(){
		console.log("File Write Cancelled by User");
	}
	
	/**********************************************************************************************************************
	 * Load Utilities
	 **********************************************************************************************************************/

	/*
	 * 
	 */
	FU.LoadFile = function(params){
		
		//Required variables
		var fileType;
		var loadMechanism;
		var remoteURL;
		var localURL;
		var fileName;
		var file;
		var temporary;
		var returnType; //fileEntry, file, url, data
		
		//Optional Callbacks
		var loaded = params.loaded ? params.loaded : Loaded;
		var notsupported = params.notsupported ? params.notsupported : NotSupported;
		var onerror = params.onerror ? params.onerror : OnError;
		var onprogress = params.onprogress ? params.onprogress : OnProgress;
		var onabort = params.onabort ? params.onabort : OnAbort;
		
		//Parameter Check
		if(!params.fileType || !params.loadMechanism){
			throw new Error("Cannot Load File. Filetype and loadmechanism are required parameters");
		}
		else{
			fileType = params.fileType;
			loadMechanism = params.loadMechanism;
			temporary = params.temporary;
			
			remoteURL = params.remoteURL;
			localURL = params.localURL;
			fileName = params.fileName;
			file = params.file;
			returnType = params.returnType;
		}
		
		//Load based on the inputted Loading mechanism
		switch(loadMechanism){
			case FU.LOAD_MECHANISM.FILE:
				File_Load();
			break;
			case FU.LOAD_MECHANISM.FILESYSTEM:
				FileSystemFile_Load();
			break;
			case FU.LOAD_MECHANISM.XHR:
				XHR_Load();
			break;
			case FU.LOAD_MECHANISM.WEBWORKER:
				WebWorker_Load();
			break;
		}

		/*
		 * 
		 */
		function XHR_Load(){
			if(!params.remoteURL){
				throw new Error("Cannot load a remote file without a remote URL");
			}
			
			var request = new XMLHttpRequest();
			request.onreadystatechange = StateChanged;
			request.open("GET", remoteURL, true);
			
			if(fileType === FU.FILE_TYPE.BINARY)
				request.responseType = 'arraybuffer';
				
			request.send(null);
			
			function StateChanged() {
				if(this.readyState == 4 && this.status == 200) {
					var responseData;
					if(fileType === FU.FILE_TYPE.BINARY){
						var arrayBuffer = this.response; // Note: not oXHR.responseText  
					   	if (arrayBuffer) {  
						    //var byteArray = new Uint8Array(arrayBuffer);  
						    //for (var i = 0; i < byteArray.byteLength; i++) {  
						    	//byteArray[i] = xhr.response.charCodeAt(i) & 0xff;
						    //}
						    responseData = arrayBuffer;  
						}
						else{
							//Invalid response
						}
					}
					else{
						if(this.responseText != null){
							responseData = this.responseText; 
						}
						else{
							//Invalid response
						}
					}
					
					//Fire the callback
					loaded(responseData);
					
				 } else if (this.readyState == 4 && this.status != 200) {
					  //Network failure or wrong page
				}
			}
		};
		
		/*
		 * 
		 */
		function File_Load(){
			if(!params.file){
				throw new Error("Cannot Load File. File parameter is not specified.");
			}
			
			//Init the FileReader
			var reader = new FileReader();
					
			// init the reader event handlers
			reader.onerror = onerror;
			reader.onprogress = onprogress;
			reader.onabort = onabort;
			
			reader.onloadend = function(evt){
				//Get the data from the target result
		    	var data = evt.target.result; 
		
				//Fire Callback
				loaded(data, file.name);
			}

			//Create a Sliced File
			if(params.sliceParams !== undefined){
				if (file.webkitSlice) {
					file = file.webkitSlice(params.sliceParams.startIndex, params.sliceParams.stopIndex)
				} else if (file.mozSlice) {
					file = file.mozSlice(params.sliceParams.startIndex, params.sliceParams.stopIndex)
				}
			}
			
			//Read by user supplied File Type
			if(fileType === FU.FILE_TYPE.TXT)
				reader.readAsText(file);	
			else
				reader.readAsBinaryString(file);
		};
		
		/*
		 * 
		 */
		function FileSystemFile_Load(){
			if(!params.file && !params.localURL && !params.fileName){
				throw new Error("Cannot Load File. The correct parameters are not specified.");
			}
			
			var fs;
			if(temporary)
				fs = FU.TempFileSystem;
			else
				fs = FU.FileSystem;
				
			function returnData(fileEntry){
				if(params.returnType && returnType === "fileEntry"){
					loaded(fileEntry);
				}
				else if(params.returnType && returnType === "url"){
					loaded(fileEntry.toURL());
				}
				else{
					// Get a File object representing the file,
				    // then use FileReader to read its contents.
				    fileEntry.file(function(loadedFile){
				    	if(params.returnType && returnType === "file"){
							loaded(loadedFile);
						}
						else{
							//Define file
				   			file = loadedFile;
				   			params.file = loadedFile;
				   			
				   			//Load the file.
					    	File_Load(file);
						}
				    }, errorHandler);
				}
			}
				
			if(params.file){
				fs.root.getFile(file.fullPath, {}, function(fileEntry) {
					returnData(fileEntry);
				}, errorHandler);
			}
			else if(params.localURL){
				//Add root to filepath;
				var filePath = FU.LocalRoot.concat("/" + localURL);

				fs.root.getFile(filePath, {}, function(fileEntry) {
				    returnData(fileEntry);
				}, errorHandler);	
			}
			else if(params.fileName){
				FU.GetFileFromFilename(fileName, temporary, function(fileEntry){
					returnData(fileEntry);
				})
			}
		};
		
		/*
		 * 
		 */
		function WebWorker_Load(){
			if(!params.remoteURL){
				throw new Error("Cannot Load File via WebWorker. Remote URL is required.");
			}
			
			worker = new Worker( remoteURL );
			worker.onmessage = function WorkerMessage( event ) {
				loaded(event.data);
			};
			
			//Post
			worker.postMessage( new Date().getTime() );
		};
	};
	
	/**********************************************************************************************************************
	 * Save Utilities
	 **********************************************************************************************************************/
	
	FU.SaveFile = function(params){
		
		//Required variables
		var remoteAsset;
		var filePath;
		var temporary = false;
									
		//Parameter Check
		if(params.remoteAsset === undefined ){
			throw new Error("Cannot Save File: " + params.filePath + " Parameters are not defined!");
		}
		else{
			remoteAsset = params.remoteAsset;
			filePath = params.filePath;
			temporary = params.temporary;
		}
		
		//Optional Callbacks
		var saved = params.saved ? params.saved : Saved;
		var notsupported = params.notsupported ? params.notsupported : NotSupported;
		var onerror = params.onerror ? params.onerror : OnError;
		var onprogress = params.onprogress ? params.onprogress : OnProgress;
		var onabort = params.onabort ? params.onabort : OnAbort;

  		var fileDir = "/" + FU.LocalRoot + filePath;
  		
	    if(temporary){
	    	var uuid;
	    	
	    	//Calculate Byte Size - Matches only the 10 bytes that are non-initial characters in a multi-byte sequence.
		    var m = encodeURIComponent(remoteAsset).match(/%[89ABab]/g);
		    var bLength = remoteAsset.length + (m ? m.length : 0) + 100;
	    
  			 //Generate a Unique ID.
		    uuid = UUID.generate();
		    
		    //Parse the path
		    var parsedURI = parseUri(filePath)
		    
		    ///Create a unique folder for the saved file (So that one does not get overwritten)
		    var tmpDir = fileDir.concat(parsedURI.directory, "/", uuid, "/", parsedURI.file);
		    
		    Save(tmpDir);
		}
		else{
			Save(fileDir);
		}
		
		function Save(fileDir){
			var fs;
			if(temporary)
				fs = FU.TempFileSystem;
			else
				fs = FU.FileSystem;
			
			//Create the file
	    	fs.root.getFile(fileDir, {create: true}, function(fileEntry) {
	
			    // Create a FileWriter object for our FileEntry (log.txt).
			    fileEntry.createWriter(function(fileWriter) {
			
					// Create a new Blob and write it to log.txt.
			      	var bb = new BlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
			      	bb.append(remoteAsset);
			      	fileWriter.write(bb.getBlob('application/octet-stream'));
		
					//Setup the callbacks
					fileWriter.onerror = ( this.onerror || FileWriter_OnError );
					fileWriter.onprogress = ( this.onprogress || FileWriter_OnProgress );
					fileWriter.onabort = ( this.onabort || FileWriter_OnAbort );
					
				    fileWriter.onwriteend = function(e) {
				    	var url = fileEntry.toURL();
						saved(url);
					};
				}, errorHandler);
			}, errorHandler);
		}
	};
	
	/**********************************************************************************************************************
	 * Misc. Utilities
	 **********************************************************************************************************************/

	FU.CheckFileSystemForFile = function(filePath, temporary, callback){
		//Add root to filepath;
		var filePath = FU.LocalRoot.concat("/" + filePath);
		
		var fs;
		if(temporary)
			fs = FU.TempFileSystem;
		else
			fs = FU.FileSystem;
			
		//determine if file is already local
		fs.root.getFile(filePath, {create: false}, 
			function(fileEntry) {
				callback(fileEntry);
			}, 
			function() {
				callback(undefined);
			}
		);
	};
	
	FU.CreateDirectory = function(directory, temporary, callback){
		//Add root to filepath;
		var filePath = "/" + FU.LocalRoot.concat("/" + directory);
		
		var fs;
		if(temporary)
			fs = FU.TempFileSystem;
		else
			fs = FU.FileSystem;
			
		 fs.root.getDirectory(filePath, {create: true}, function(dirEntry) {
		 		callback()
		 	}, errorHandler);
	};
	
	FU.GetFileFromFilename = function(filename, temporary, callback){

		var recurseFileObject = function(fileObject){
			var dirReader = fileObject.createReader();
			
			dirReader.readEntries (function(results) {
			    var entries = toArray(results);
			    for (var i=0; i < entries.length; i++) {
					if(!entries[i].isDirectory && entries[i].name === filename){
						callback(entries[i]);
					}else if(entries[i].isDirectory){
						recurseFileObject(entries[i]);
					}
				};
			}, errorHandler);
		}

		var fs;
		if(temporary)
			fs = FU.TempFileSystem;
		else
			fs = FU.FileSystem;
			
  		recurseFileObject(fs.root); // Start reading dirs.
	};

	function toArray(list) {
	  return Array.prototype.slice.call(list || [], 0);
	}
	
}( window.FU = window.FU|| {} ));