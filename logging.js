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

function getStamp() {
  var date = new Date();

  return [
    '[', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()], ' ',
    date.getFullYear(), '-', (date.getMonth() + 1), '-', date.getDate(),
    ' ', date.getHours(), ':', date.getMinutes(), ':', date.getSeconds(), '.',
    date.getMilliseconds(), ']'
  ].join('').grey;

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


