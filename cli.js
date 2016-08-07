#!/usr/bin/env node

/*
...

Copyright 2016 Robin Millette <robin@millette.info> (<http://robin.millette.info>)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the
[GNU Affero General Public License](LICENSE.md)
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'

// self
const jheson = require('./')

// npm
const meow = require('meow')

const cli = meow([
  'Usage',
  '  $ jheson [input]',
  '',
  'Options',
  '  --mold Defaults to ./mold.json',
  '',
  '  --pretty Pretty print',
  '',
  '  --file Force file, autodetect if url otherwise (begin with http)',
  '',
  '  --cast Cast jheson using mold; otherwise make jheson version (lighter)'
], {
  boolean: ['pretty', 'cast', 'file'],
  default: { mold: './mold.json' }
})

const p = (cli.flags.file || cli.input[0].indexOf('http'))
  ? jheson.jsonFromFile(cli.input[0])
  : jheson.jsonFromUrl(cli.input[0])

Promise.all([p, jheson.moldMethods(cli.flags.mold)])
  .then((f) => [JSON.stringify(f[0]).length, cli.flags.cast ? f[1].cast(f[0]) : f[1].jheson(f[0])])
  .then((g) => {
    const out = cli.flags.pretty ? JSON.stringify(g[1], null, ' ') : JSON.stringify(g[1])
    console.error('Old size:', g[0], 'new size:', out.length, 'ratio:', out.length / g[0])
    console.log(out)
  })
  .catch((e) => console.error('E1:', e))
