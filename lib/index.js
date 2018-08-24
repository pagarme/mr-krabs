const ECS = require('aws-sdk/clients/ecs')
const PAGINATION = 100

const ecs = new ECS()

function getServicesDetails (services = [], cluster) {
  let batches = []
  while (services.length) {
    // Maximum of 10 described services
    batches.push(services.splice(0, 10))
  }
  return Promise.all(
    batches.map(batch => {
      return ecs.describeServices({ services: batch, cluster}).promise()
    })
  )
    .then(resolvedBatches => resolvedBatches.reduce((res, acc) => res.concat(acc.services), []))
    .then(services => 
      services.map(({serviceName, desiredCount, runningCount, pendingCount }) => {
        return {
          serviceName,
          desiredCount,
          runningCount,
          pendingCount
        }
      })
    )
}

function downScaleService (serviceName, clusterName) {
  return ecs.updateService({
    service: serviceName,
    cluster: clusterName,
    desiredCount: 0,
  }).promise()
}

function listServices (...options) {
  let { clusterName = '', serviceName = ''} = Object.assign({}, ...options)
  return ecs.listServices({
    cluster: clusterName,
    maxResults: PAGINATION,
  })
    .promise()
    .then(({ serviceArns }) => 
      serviceArns
        .filter(serviceArn => serviceArn.match((new RegExp(serviceName, 'g'))))
        .map(serviceArn => serviceArn.split('/').pop())
    )
}

function downScaleAllRuningServices (...options) {
  options = Object.assign({}, ...options)
  return listServices(options)
    .then((services) => 
      getServicesDetails(services, options.clusterName)
    )
    .then((services) => 
      services
        .filter(service => !!service.desiredCount)
    )
    .then((services) => 
      Promise.all(
        services.map(
          service => {
            return downScaleService(service.serviceName, options.clusterName)
          }
        )
      )
    )
    .catch(error => {
      console.error(`Hey, that's still costing me 2 dollars!!\nError: ${error}\n`)
    })
}

function listClusters (...options) {
  let { clusterName = ''} = Object.assign({}, ...options)
  return ecs.listClusters({ maxResults: PAGINATION })
    .promise()
    .then(({ clusterArns }) => 
      clusterArns
        .filter(clusterArn => clusterArn.match((new RegExp(clusterName, 'g'))))
    )
    .catch(console.error)
}

module.exports = {
  listServices,
  listClusters,
  downScaleService,
  downScaleAllRuningServices,
}
