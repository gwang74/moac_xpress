var winston = require('winston');
var path = require('path')
require('winston-daily-rotate-file');
var dateformat = require('dateformat');

// silly, debug, verbose, info, warn, error
var level = "info";
var filename = path.resolve(__dirname,"../../logs/log");
var filesize = "1000000";
var filecount = "100";

var timestampFn = function () {
	var now = new Date();
	return dateformat(now, "yyyy-mm-dd HH:MM:ss");
};

var logger = new winston.Logger({
	level: level,
	transports: [
		new winston.transports.Console({
			prettyPrint: true,
			colorize: true,
			timestamp: timestampFn,
			handleExceptions: true
		}),
		new winston.transports.DailyRotateFile({
			filename: filename,
			datePattern: '.yyyy-MM-dd.log',
			timestamp: timestampFn,
			maxsize: filesize,
			maxFiles: filecount,
			json: false
		})
	]
});

module.exports = logger;

