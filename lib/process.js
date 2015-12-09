var EventEmitter = require('events');
var util = require('util');

module.exports = PseudoProcess;

util.inherits(PseudoProcess, EventEmitter);
function PseudoProcess(argv) {
  // if (!new.target) throw "PseudoProcess() must be called with new";
  if (!(this instanceof PseudoProcess)) throw "PseudoProcess() must be called with new";

  EventEmitter.call(this);

  var _this = this;
  function proxy(prop) {
    Object.defineProperty(this, prop, {
      enumerable: true, writable: false, configurable: false,
      value: process[prop]
    });
  }

  Object.defineProperty(this, 'argv', {
    enumerable: true, writable: true, configurable: true,
    value: argv
  });

  Object.defineProperty(this, 'abort', {
    enumerable: true, writable: false, configurable: false,
    value: function() {
      throw new Error('Not Implemented');
    }
  });
  proxy('arch');
  Object.defineProperty(this, 'chdir', {
    enumerable: true, writable: false, configurable: false,
    value: function() {
      throw new Error('Not Implemented');
    }
  });
  proxy('config');
  Object.defineProperty(this, 'cwd', {
    enumerable: true, writable: false, configurable: false,
    value: function() {
      throw new Error('Not Implemented');
    }
  });
  Object.defineProperty(this, 'disconnect', {
    enumerable: true, writable: false, configurable: false,
    value: function() {
      throw new Error('Not Implemented');
    }
  });
  proxy('env'); // TODO: allow patching
  proxy('execArgv');
  proxy('execPath');
  Object.defineProperty(this, 'exit', {
    enumerable: true, writable: false, configurable: false,
    value: function() {
      throw new Error('Not Implemented');
    }
  });
  // exitCode
  proxy('hrtime');
  Object.defineProperty(this, 'kill', {
    enumerable: true, writable: false, configurable: false,
    value: function() {
      throw new Error('Not Implemented');
    }
  });
  // TODO: mainModule
  proxy('memoryUsage');
  proxy('nextTick');
  proxy('pid');
  proxy('platform');
  proxy('release');
  Object.defineProperty(this, 'send', {
    enumerable: true, writable: false, configurable: false,
    value: function() {
      throw new Error('Not Implemented');
    }
  });
  // TODO: allow piping
  proxy('stderr');
  proxy('stdin');
  proxy('stdout');
  Object.defineProperty(this, 'title', {
    enumerable: true, configurable: false,
    get: function() { return '<pseudo>'; },
    set: function(val) {},
  });
  Object.defineProperty(this, 'umask', {
    enumerable: true, writable: true, configurable: false,
    value: process.umask
  });
  proxy('uptime');
  proxy('version');
  proxy('versions');

}
