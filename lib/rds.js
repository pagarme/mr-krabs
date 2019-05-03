const RDS = require('aws-sdk/clients/rds')

const rds = new RDS()

function listRds () {
  return rds.describeDBInstances().promise()
    .then(({ DBInstances }) => {
      if (!DBInstances) {
        return []
      }
      return DBInstances
        .map(instance => {
          return {
            name: instance.DBName,
            arn: instance.DBInstanceArn,
            status: instance.DBInstanceStatus,
          }
        })
    })
}

function stopRds (name) {
  return rds.stopDBInstance({
    DBInstanceIdentifier: name,
  }).promise()
}

function startRds (name) {
  return rds.startDBInstance({
    DBInstanceIdentifier: name,
  }).promise()
}

module.exports = {
  listRds,
  stopRds,
  startRds
}