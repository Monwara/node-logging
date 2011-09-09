/**
 * # Logging library for Node.js
 *
 * @author Branko Vukelic <branko@herdhound.com>
 * @license MIT
 */

var c = require('colors');
var util = require('util');

var level = 'info';
var LEVELS = {
  info: 1,
  debug: 2,
  error: 3,
  critical: 4
};

var logging = exports;

function log(msg, minlvl, flag, trace, block) {
  if (LEVELS[level] > LEVELS[minlvl]) {
    return;
  }

  block = block || false;

  if (block) {
    util.debug(flag + ': ' + msg);
  } else {
    util.log(flag + ': ' + msg);
  }

  if (trace) {
    console.trace();
  }
}

logging.inf = function(msg, trace) {
  log(msg, 'INF'.bold.green, 'info', trace);
};

logging.dbg = function(msg, trace) {
  log(msg, 'DBG'.bold.yellow, 'debug', trace);
};

logging.err = function(msg, trace) {
  log(msg, 'ERR'.bold.red, 'error', trace);
};

logging.bad = function(msg) {
  log(msg, 'BAD'.bold.red, 'critical', true);
};

logging.inspect = function(obj, trace) {
  logging.debug(utils.inspect(obj, true, null), trace);
};


