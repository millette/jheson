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

// core
const fs = require('fs')

// npm
const got = require('got')

const jsonFromUrl = (u) => got(u, { json: true }).then((x) => x.body)

const jsonFromFile = (filename) => new Promise((resolve, reject) => fs.readFile(filename, 'utf-8', (err, data) => {
  if (err) { return reject(err) }
  try { resolve(JSON.parse(data)) }
  catch (e) { reject(e) }
}))

const jheson = (mold, j) => {
  const tops = []
  Object.keys(mold).sort().forEach((k) => {
    const mid = []
    Object.keys(mold[k]).sort().forEach((m) => {
      const submid = []
      Object.keys(mold[k][m]).sort().forEach((s) => {
        if (s === 'description') {
          if (j[k][m][s] !== mold[k][m][s]) { console.error('Warning: ', k, m, s, 'doesn\'t match mold.') }
          return
        }
        if (typeof j[k][m][s] === 'undefined') { console.error('Warning: ', k, m, s, 'value not found.') }
        submid.push(j[k][m][s])
      })
      mid.push(submid)
    })
    tops.push(mid)
  })
  return tops
}

const cast = (mold, he) => {
  const casted = {}
  const topKeys = Object.keys(mold).sort()
  if (he.length > topKeys.length) { console.error('Warning: extraneous data on top.') }
  topKeys.forEach((k, nk) => {
    casted[k] = {}
    const midKeys = Object.keys(mold[k]).sort()
    if (he[nk].length > midKeys.length) { console.error('Warning: extraneous data at ', k) }
    midKeys.forEach((m, nm) => {
      let ns = 0
      casted[k][m] = {}
      const bottomKeys = Object.keys(mold[k][m]).sort()
      bottomKeys.forEach((s) => {
        if (s === 'description') {
          casted[k][m][s] = mold[k][m][s]
        } else {
          if (typeof he[nk][nm][ns] === 'undefined') {
            console.error('Warning: missing data at ', k, m, s)
          } else {
            casted[k][m][s] = he[nk][nm][ns]
          }
          ++ns
        }
      })
      if (typeof he[nk][nm][ns] !== 'undefined') { console.error('Warning: extraneous data at ', k, m, ns) }
    })
  })
  return casted
}

const moldMethods = (filename) => jsonFromFile(filename)
  .then((mold) => { return { cast: cast.bind(null, mold), jheson: jheson.bind(null, mold) } })

module.exports = {
  jsonFromFile: jsonFromFile,
  jsonFromUrl: jsonFromUrl,
  moldMethods: moldMethods
}
