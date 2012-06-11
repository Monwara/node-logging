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

logging.inf('TESTING BLACKLISTING');
logging.setBlacklist([/foo/, '\n']);
logging.inf('You should not see any words here -->foo<--');
logging.inf('No new line in this text.\nThis would normally be the second line.');

logging.inf('TESTING WHITELISTING');
logging.setWhitelist(['[a-zA-Z0-9 ]']);
logging.inf('You should now see words here -->foo<-- but no arrows');
logging.inf('There shoulšđd be no šđforeign letters.');

