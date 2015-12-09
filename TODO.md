Parsing
=======

subset of shell script

* [ ] create ast from parsed command
* [ ] run with proper shell support
* [ ] figure out a sane way to detect when a child has no pending events.
* [ ] operator support
  * [ ] `&&` operator
  * [ ] `;` operator
  * [ ] Environment variables: `A=1`, `env`
  * [ ] `&` operator, `wait`
  * [ ] `||` operator
  * [ ] subshell `(`/')' emulation
  * [ ] piping and redirection: `|`, `>`, `<`
  * [ ] support for basic unix commands via shelljs, and sleep.
* [ ] support a more readable form of scripts in package.json, that can be synced to scripts

bail if:
* TODO

Tests
=====

write them!
