#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler'); //kp
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var CHECKSURL_DEFAULT = "http://fierce-reaches-1073.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists = function(str) {
  var pattern = new RegExp("^(http:\/\/|https:\/\/|ftp:\/\/|www.){1}([0-9A-Za-z]+\.)");
  if(!pattern.test(str)) {
    console.log("%s is not a valid url. Exiting.", str);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code 
  } else {
    return str;
  }
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    // console.log($.html());
    return checkHtml(checksfile);
};

var checkHtml = function(checksfile) {
    var checks = loadChecks(checksfile).sort();
    //console.log($.html());
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file [html_file]', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url [check_url]', 'web url', clone(assertURLExists))
        .parse(process.argv);
   // console.log(program.file);
   // console.log(program.url);
    if (program.file == null && program.url == null) {
	console.log("You need to either set an url or a file. Exiting.");
	process.exit(1);
    }
    if (program.file) {
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log("filecheck: "+outJson);
    } else {
	rest.get(program.url).on('complete', function(result) {
	    if (result instanceof Error) {
	//	console.log('Error: ' + result.message);
		process.exit(1);
	    } else {
	//	console.log(result);
		$ = cheerio.load(result);
		var checkJson = checkHtml(program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	    }
	});
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
