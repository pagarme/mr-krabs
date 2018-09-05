const mrKrabs = require('./lib')
const configFile = require('./krabs.json')

module.exports = Object.keys(mrKrabs)
  .reduce((result, attributeKey) => {
    result[attributeKey] = mrKrabs[attributeKey].bind(null, configFile)
    return result
  }, {})
