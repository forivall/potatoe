#!/usr/bin/env node

var nopt = require('nopt');
var readJson = require('read-package-json');
var shellParse = require('shell-quote').parse;
var npmFindPrefix = require('../packages/npm-find-prefix'); // TODO: publish this.
var objectAssign = require('object-assign');
var glob = require('glob');
var path = require('path');
var vm = require('vm');
var fs = require('fs');

var PseudoProcess = require('../lib/process');
var Module = require('module');
var args = nopt({}, {}, process.argv, 2);
var cmdName = args.argv.remain[0];
if (!cmdName) { console.log('no script specified'); process.exit(1); }

var localPrefix = args.prefix;// or findPrefix
var callback = function(err) { console.log(err && err.stack || err); process.exit(1); }

npmFindPrefix(process.cwd(), function(err, prefix) {
  if (err) return callback(err);
  readJson(path.join(prefix, 'package.json'), function(err, pkg) {
    if (err) return callback(err);

    var cmd = pkg.scripts[cmdName];
    if (!cmd) { console.log('script "' + cmdName + '" not found'); process.exit(1); }
    var cmdParsed = shellParse(cmd);


    // TODO: make sure that the command is in a node_modules/.bin in the prefix
    var scriptFile = path.join(prefix, 'node_modules/.bin', cmdParsed[0]);
    var scriptDir = path.join(prefix, 'node_modules/.bin');
    try {
      // TODO: async
      var linkPath = fs.readlinkSync(scriptFile);
      scriptFile = path.resolve(prefix, 'node_modules/.bin', linkPath);
      scriptDir = path.dirname(scriptFile);
    } catch (e) {
      // if (e.code !== 'EINVAL') throw e;
    }
    fs.readFile(scriptFile, 'utf-8', function(err, scriptSource) {
      if (err) return callback(err);

      var scriptContext = {};

      // set up console
      scriptContext.console = console;

      // set up process
      scriptContext.process = new PseudoProcess(
        [].concat.apply([process.argv[0]], cmdParsed.map(function(arg) {
          // TODO: option to not process globs
          if (arg.op === "glob") {
            // TODO: async
            return glob.sync(arg.pattern);
          }
          return [arg];
        }))
      );

      // set up module
      var self = scriptContext.module = scriptContext.process.mainModule = new Module('.');
      self.filename = scriptFile;
      self.paths = Module._nodeModulePaths(path.dirname(scriptFile));

      // set up require
      var scriptRequire = scriptContext.require = function(path) {
        return self.require(path);
      };
      scriptRequire.resolve = function(request) {
        return Module._resolveFilename(request, self);
      };
      scriptRequire.main = self;
      scriptRequire.extensions = objectAssign({}, require.extensions);
      scriptRequire.cache = {};

      // strip out hashbang
      if (scriptSource[0] === '#') {
        scriptSource = scriptSource.replace(/^#.*/, '');
      }

      // load
      var script = new vm.Script(scriptSource, {filename: scriptFile, displayErrors: true});

      // exec
      script.runInNewContext(scriptContext);
    })

  });
});
