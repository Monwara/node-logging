/**
 * # Logging library for Node.js
 *
 * @author Branko Vukelic <branko@herdhound.com>
 * @license MIT
 * @version 0.1.3
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

var EXCLUDES = ['password'];

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

function humanize(i) {
  if (i > 1073741824) {
    return Math.round((i / 1073741824) * 100) / 100 + ' GiB';
  } else if (i > 1048576) {
    return Math.round((i / 1048576) * 100) / 100  + ' MiB';
  } else {
    return Math.round((i / 1024) * 100) / 100 + ' KiB';
  }
}

function prettyPrintObj(o, excludes) {
  excludes = typeof excludes === 'undefined' ? EXCLUDES : excludes;

  if (!o || typeof o !== 'object' || !Object.keys(o).length) {
    return '*'.grey + ' ' + 'n/a'.green + '\n';
  }

  var rows = [];

  Object.keys(o).forEach(function(key) {
    var value;

    if (excludes.length && excludes.indexOf(key) < 0) {

      if (o[key] === null) {
        value = 'null'.grey;
      } else if (typeof o[key] === 'undefined') {
        value = 'undefined'.grey;
      } else {
        value = o[key].toString();
      }

    } else {
      value = '(excluded)'.grey;
    }

    rows.push('*'.grey + ' ' + key.green + ': ' + value);
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

logging.setExcludes = function(excludes) {
  EXCLUDES = excludes;
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

logging.startTimer = function() {
  var startTime = (new Date()).getTime();

  return function(msg, trace) {
    msg = msg + ' ' + ('(took ' + ((new Date()).getTime() - startTime) + 'ms)').yellow;
    logging.dbg(msg, trace);
  };
};

logging.requestLogger = function(req, res, next) {
  var startTime = (new Date()).getTime();
  var log = 'Request for '.green.bold + 
      (req.method + ' ' + req.url.toString()).yellow.bold + '\n\n';
  var memoryUsage = process.memoryUsage();
  var userMessages = [];
  var connectionDetails;
  var socket = req.connection.socket;

  req.log = {};

  req.log.startTimer = function(name) {
    var time = (new Date()).getTime();

    req.log['end' + name] = function(msg) {
      var start = time - startTime;
      var end = (new Date()).getTime() - startTime;
      time = (new Date()).getTime() - time;
      userMessages.push(('(' + start + 'ms -> ' + end + 'ms)').yellow.bold + 
                        ' ' + msg.toString().green + ' ' +
                        ('(took ' + time + 'ms)').yellow);
    };
  };

  req.log.push = function(msg) {
    var start = (new Date()).getTime() - startTime;
    userMessages.push(('(' + start + 'ms)').yellow.bold + ' ' + 
                     msg.toString().green);
  };

  req.log.terminate = function(msg) {
    log += '\nLOGGING TERMINATED\n'.red.bold;
    log += msg.yellow.bold;
    logging.dbg(log);
    log = null;
  };

  res.on('finish', function() {
    var endTime = (new Date()).getTime();

    log += 'Request details:\n'.cyan.bold;

    log += '\n';

    log += 'Path parameters:\n'.cyan.italic;
    log += prettyPrintObj(req.params) + '\n';

    log += 'Query parameters:\n'.cyan.italic;
    log += prettyPrintObj(req.query) + '\n';

    log += 'Request body:\n'.cyan.italic;
    log += prettyPrintObj(req.body) + '\n';
    log += '==/\n\n'.cyan.bold;

    Object.keys(memoryUsage).forEach(function(key) {
      memoryUsage[key] = humanize(memoryUsage[key]);
    });

    log += 'Request headers:\n'.cyan.bold;
    log += prettyPrintObj(req.headers);
    log += '==/\n\n'.cyan.bold;

    // WARN: The API used to read out response headers is private. This
    // functionality may stop working in futre Node.js releases.
    log += 'Response headers:\n'.cyan.bold;
    log += prettyPrintObj(res._headers);
    log += '==/\n\n'.cyan.bold;

    connectionDetails = {
      address: socket && socket.remoteAddress || 'n/a',
      port: socket && socket.remotePort || 'n/a',
      HTTP: req.httpVersionMajor + '.' + req.httpVersionMinor,
      SSL: req.connection.encrypted ? 'yes' : 'no',
      socket: socket && socket.type || 'n/a',
      'open connections': socket && socket.server && 
        socket.server.connections || 'n/a'
    };

    log += 'Connection details:\n'.cyan.bold;
    log += prettyPrintObj(connectionDetails);
    log += '==/\n\n'.cyan.bold;


    log += 'Memory usage:\n'.cyan.bold;
    log += prettyPrintObj(memoryUsage);
    log += '==/\n\n'.cyan.bold;

    if (userMessages.length) {
      log += 'User messages:\n'.cyan.bold;
      userMessages.forEach(function(message) {
        log += '*'.grey + ' ' + message + '\n';
      });
      log += '\n';
    }
    
    log += 'Total request time: '.cyan.bold;
    log += ((endTime - startTime) + 'ms\n').yellow.bold;

    log = res.statusCode.toString().red + ' ' + log;

    if (log) {
      logging.dbg(log);
    }
  });

  next();
};
