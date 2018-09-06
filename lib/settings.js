const path = require('path')

let config = {}

try {
  config = require(path.dirname(require.main.filename) + '/krabs')
} catch (e) {}

function injectConfig (options = {}) {
  return Object.assign({}, config, options)
}

module.exports = {
  injectConfig
}
