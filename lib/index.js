const rds = require('./rds')
const ecs = require('./ecs')

module.exports = {
  ...ecs,
  ...rds,
}
