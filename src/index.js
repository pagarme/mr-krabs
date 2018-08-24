const { ECS } = require('aws-sdk')

const ecs = new ECS()

const FILTER_SERVICE_NAME = 'webhulk'

const downScaleService = serviceName =>
  ecs.updateService({
    service: serviceName,
    cluster: 'cluster-stg',
    desiredCount: 0,
  }).promise()

ecs.listServices({
  cluster: 'cluster-stg',
  maxResults: 100,
}).promise()
  .then(({ serviceArns }) =>
    serviceArns
      .filter(str => str.includes(FILTER_SERVICE_NAME))
      .map(downScaleService)
  )
  .catch(console.error)
