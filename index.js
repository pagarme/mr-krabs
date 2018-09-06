const ECS = require('aws-sdk/clients/ecs')
const MrKrabs = require('./lib/MrKrabs')

module.exports = new MrKrabs(new ECS())
