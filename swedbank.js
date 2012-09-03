var swedbank = {
	data: "",
	extention: "",
	filename: "",
	init: function () {
		var section = document.querySelector(".sidspalt2a .sektion");
		this.parse(section);
	},
	parse: function(data) {
		var raw_filename = data.querySelector(".sektion-huvud h3").innerHTML;
		var filename = raw_filename.replace(/^\s+|\s+$/g, "").match(/[a-zA-Z ]*/);

		if (filename == "") {
			filename = "swedbank";
		}

		data = data.querySelectorAll(".sektion-innehall2 .tabell");
		data = data[data.length-1];
		var raw_headers = data.querySelectorAll("th.tabell-huvud span.tabell-kolumnrubrik");
		var headers = [];
		for (var k in raw_headers) {
			var header = raw_headers[k];

			if (typeof header.innerHTML == 'undefined') {
				continue;
			}
			
			if (header.innerHTML.match(/\<a href/)) {
				header = header.querySelector("a");
			}

			var text = "";
			if (typeof header.innerText != 'undefined') {
				text = header.innerText.replace(/^\s+|\s+$/g, "");
			}
			else {
				text = header.innerHTML.replace(/^\s+|\s+$/g, "");
				// remove the <img tags && " " that are comming with ff.
				text = text.replace(/\<img[^\>]*./g, "").replace("&nbsp;", "");
			}

			if (text.length > 0) {
				headers.push(text);
			}
		}

		var raw_rows = data.querySelectorAll("tr");
		var rows = [];
		for (var k=0;k<raw_rows.length;k++) {
			var raw_row = raw_rows[k].querySelectorAll("td");
			var row = [];
			if (raw_row.length != 6) {
				continue;
			}

			for (var key in raw_row) {
				var coll = raw_row[key];

				if (coll == null || typeof coll.innerHTML == 'undefined') {
					continue;
				}

				if (coll.innerHTML.match(/\<span/)) {
					coll = coll.querySelector("span");
				}

				var text = "";
				if (typeof coll.innerText != 'undefined') {
					text = coll.innerText.replace(/^\s+|\s+$/g, "").replace(",",".");
				}
				else {
					text = coll.innerHTML.replace(/^\s+|\s+$/g, "").replace(",",".");
					text = text.replace("&nbsp;", "");
				}

				if (text.length > 0) {
					row.push(text);
				}
			}
			rows.push(row);
		}
		this.tocsv(filename, headers, rows);
	},
	tocsv: function(filename, headers, array) {
		var csv = "";

		for (var i=0;i<headers.length;i++) {
			csv += headers[i]+",";

			if (i == headers.length-1) {
				csv = csv.substr(0, csv.length-1);
			}
		}
		csv += "\n";

		for (var i=0;i<array.length;i++) {
			for (var c=0;c<array[i].length;c++) {
				csv += array[i][c]+",";

				if (c == array[i].length-1) {
					csv = csv.substr(0, csv.length-1);
				}
			}
			csv += "\n";

			if (i == array.length-1) {
				csv = csv.substr(0, csv.length-2);
			}
		}
		this.download(filename, "csv", csv);
	},
	download: function(filename, extention, data) {
		this.data = data;
		this.extention = extention;
		this.filename = filename;

		if (typeof window.webkitStorageInfo == 'undefined') {
			// Show popup with download link & textarea with csv data.
			location.href = "data:application/octet-stream,"+encodeURIComponent(data);
			return;
		}

		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

		window.webkitStorageInfo.requestQuota(window.TEMPORARY, 50000, function(grantedBytes) {
			window.requestFileSystem(window.TEMPORARY, grantedBytes, swedbank.onInitFs, swedbank.errorHandler);
		}, swedbank.errorHandler);

		window.resolveLocalFileSystemURL(url, function(fileEntry) {
			// Downloading...
		}, swedbank.errorHandler);

	},
	onInitFs: function (fs) {

		fs.root.getFile(swedbank.filename+"."+swedbank.extention, {create:true}, function(fileEntry) {

			fileEntry.createWriter(function(fileWriter) {

				var bb = new WebKitBlobBuilder();
				bb.append(swedbank.data);
				fileWriter.write(bb.getBlob("text/plain"));

				location.href = fileEntry.toURL();

			}, swedbank.errorHandler);
		}, swedbank.errorHandler);
	},
	errorHandler: function(e) {
		console.log(e);	
	}
};

swedbank.init();