var logging = require('./logging');

logging.inf('test info');
logging.dbg('test debug');
logging.err('test err');
logging.bad('test bad');

logging.dbg('Pretty-print test:\n' + logging.pretty({
  a: 1,
  b: 'foo',
  c: { test: 'me' },
  d: [1,2,3,4,5],
  e: null,
  f: undefined,
  g: new Date()
}));

