#!/usr/bin/env node

var nopt = require('nopt');
var readJson = require('../packages/read-package-json'); // TODO: publish this.
var shellParse = require('shell-quote').parse;
var npmFindPrefix = require('npm-find-prefix');
var path = require('path');
var vm = require('vm');
var fs = require('fs');

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
      scriptContext.process = {};
      scriptContext.process.argv = ['node'].concat(cmdParsed.map(function(arg) {
        if (arg.op === "glob") { return arg.pattern; }
        return arg;
      }));
      scriptContext.require = function(id) {
        // TODO: properly require non-core modules that are in the script's local node_modules
        // currently, this will only work with npm@3+
        if (/^\.{0,2}\//.test(id)) {
          console.log(scriptDir);
          id = path.join(scriptDir, id);
        }
        return require(id);
      }

      if (scriptSource[0] === '#') {
        scriptSource = scriptSource.replace(/^#.*/, '');
      }

      var script = new vm.Script(scriptSource, {filename: scriptFile, displayErrors: true});
      script.runInNewContext(scriptContext);
    })

  });
});
