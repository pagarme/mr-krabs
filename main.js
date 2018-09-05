const path = require('path')
const mrKrabs = require('./lib')
const configFile = require(path.dirname(require.main.filename) + '/krabs.json')

module.exports = Object.keys(mrKrabs)
  .reduce((result, attributeKey) => {
    result[attributeKey] = mrKrabs[attributeKey].bind(null, configFile)
    return result
  }, {})
