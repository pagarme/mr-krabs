const { injectConfig } = require('./settings')
const PAGINATION = 100

class MrKrabs {
  constructor (ecs) {
    this.ecs = ecs
  }

  getServicesDetails (services = [], cluster) {
    let batches = []

    while (services.length) {
      // Maximum of 10 described services
      batches.push(services.splice(0, 10))
    }

    return Promise.all(
      batches.map(batch => {
        return this.ecs.describeServices({ services: batch, cluster}).promise()
      })
    )
      .then(resolvedBatches => resolvedBatches.reduce((res, acc) => res.concat(acc.services), []))
      .then(services =>
        services.map(({serviceName, desiredCount, runningCount, pendingCount }) => {
          return {
            serviceName,
            desiredCount,
            runningCount,
            pendingCount,
          }
        })
      )
  }

  downScaleService (serviceName, clusterName) {
    return this.ecs.updateService({
      service: serviceName,
      cluster: clusterName,
      desiredCount: 0,
    }).promise()
  }

  upScaleService (serviceName, clusterName) {
    return this.ecs.updateService({
      service: serviceName,
      cluster: clusterName,
      desiredCount: 1,
    }).promise()
  }

  listServices (options) {
    let { clusterName = '', serviceName = ''} = injectConfig(options)

    return this.ecs.listServices({
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

  downScaleAllRuningServices (options) {
    options = injectConfig(options)
    return this.listServices(options)
      .then((services) =>
        this.getServicesDetails(services, options.clusterName)
      )
      .then((services) =>
        services
        .filter(service => !!service.desiredCount)
      )
      .then((services) =>
        Promise.all(
          services.map(
            service => {
              return this.downScaleService(service.serviceName, options.clusterName)
            }
          )
        )
      )
      .catch(error => {
        console.error(`Hey, that's still costing me 2 dollars!!\nError: ${error}\n`)
      })
  }

  upScaleAllStoppedServices (options) {
    options = injectConfig(options)
    return this.listServices(options)
      .then((services) =>
        this.getServicesDetails(services, options.clusterName)
      )
      .then((services) =>
        services
        .filter(service => !service.desiredCount)
      )
      .then((services) =>
        Promise.all(
          services.map(
            service => {
              return this.upScaleService(service.serviceName, options.clusterName)
            }
          )
        )
      )
      .catch(error => {
        console.error(`Hey, that's still costing me 2 dollars!!\nError: ${error}\n`)
      })
  }

  listClusters (options) {
    let { clusterName = '' } = injectConfig(options)
    return this.ecs.listClusters({ maxResults: PAGINATION })
      .promise()
      .then(({ clusterArns }) =>
        clusterArns
        .filter(clusterArn => clusterArn.match((new RegExp(clusterName, 'g'))))
      )
      .catch(console.error)
  }
}

module.exports = MrKrabs
