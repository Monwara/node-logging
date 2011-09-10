/**
 * # Logging library for Node.js
 *
 * @author Branko Vukelic <branko@herdhound.com>
 * @license MIT
 */

var c = require('colors');
var util = require('util');

var level = 'debug';
var LEVELS = {
  debug: 1,
  info: 2,
  error: 3,
  critical: 4
};

var logging = exports;

function getStamp() {
  var date = new Date();

  return [
    '[', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()], ' ',
    date.getFullYear(), '-', (date.getMonth() + 1), '-', date.getDate(),
    ' ', date.getHours(), ':', date.getMinutes(), ':', date.getSeconds(), '.',
    date.getMilliseconds(), ' GMT', date.getTimezoneOffset() / 60, ']'
  ].join('').grey;

}

function prettyPrintObj(o) {
  if (!o || typeof o !== 'object' || !Object.keys(o).length) {
    return '*'.grey + ' ' + 'n/a'.green + '\n';
  }

  var rows = [];

  Object.keys(o).forEach(function(key) {
    rows.push('*'.grey + ' ' + key.green + ': ' + o[key].toString());
  });

  return rows.join('\n') + '\n';
}

function log(msg, flag, minlvl, trace, block) {
  if (LEVELS[level] > LEVELS[minlvl]) {
    return;
  }

  block = block || false;

  if (block) {
    util.debug(getStamp() + ' ' + flag + ': ' + msg);
  } else {
    console.log(getStamp() + ' ' + flag + ': ' + msg);
  }

  if (trace) {
    console.trace();
  }
}

logging.pretty = prettyPrintObj;

logging.setLevel = function(lvl) {
  if (Object.keys(LEVELS).indexOf(level) < 0) {
    level = 'info';
  } else {
    level = lvl;
  }
};

logging.inf = function(msg, trace) {
  log(msg, 'INF'.bold.green, 'info', trace);
};

logging.dbg = function(msg, trace) {
  log(msg, 'DBG'.bold.yellow, 'debug', trace);
};

logging.err = function(msg, trace) {
  log(msg, 'ERR'.bold.red, 'error', trace);
};

logging.bad = function(msg, trace) {
  log(msg.toString().red.bold, 'BAD'.bold.red.inverse, 'critical', trace, true);
};

logging.inspect = function(obj, trace) {
  logging.debug(utils.inspect(obj, true, null), trace);
};

logging.requestLogger = function(req, res, next) {
  var startTime = (new Date()).getTime();
  var log = 'Request for '.green.bold + req.url.toString().yellow.bold + '\n\n';

  res.on('finish', function() {
    var endTime = (new Date()).getTime();
    
    log += 'Total request time: '.cyan.bold;
    log += ((endTime - startTime) + 'ms\n').yellow.bold;

    logging.dbg(log);
  });
  
  log += 'Request details:\n'.cyan.bold;

  log += '\n';

  log += 'Request parameters:\n'.cyan.italic;
  log += prettyPrintObj(req.params) + '\n';

  log += 'URL parameters:\n'.cyan.italic;
  log += prettyPrintObj(req.query) + '\n';

  log += 'Request body:\n'.cyan.italic;
  log += prettyPrintObj(req.body) + '\n';
  log += '==/\n\n'.cyan.bold;

  log += 'Memory usage:\n'.cyan.bold;
  log += prettyPrintObj(process.memoryUsage());
  log += '==/\n\n'.cyan.bold;

  log += 'Request headers:\n'.cyan.bold;
  log += prettyPrintObj(req.headers);
  log += '==/\n\n'.cyan.bold;

  next();
};
