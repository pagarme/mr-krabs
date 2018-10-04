<p align="center">
  <a href="https://github.com/pagarme/mr-krabs">
    <img src="https://media.giphy.com/media/yYrYPXatpCMiA/giphy.gif" alt="mr-krabs" >
  </a>
</p>

# mr-krabs

> :crab: :moneybag: A package to clear Fargate cluster tasks

## Installation

1. Make sure you have your AWS credentials correctly setup

2. Install the module:
```
npm install --save mr-krabs
```

## Usage

There are basically 2 ways of setting up the intended cluster and service name patterns:

  1 - By providing a file called `krabs.json` at the root of your project:

  ```json
  {
    "clusterName": "demoClusterName",
    "sericeName": "demoServiceName"
  }
  ```

  2 - By providing the config at the function calls as the demo above

  ```js
  const mrKrabs = require('mr-krabs')

  // DETAILS
  function getDetailsOfDemoServices () {
    return mrKrabs.listClusters({ clusterName: 'demoCluster' })
      .then(([clusterName]) =>
        mrKrabs.listServices({ clusterName, serviceName: 'demoServiceName' })
          .then(servicesNames => mrKrabs.getServicesDetails(servicesNames, clusterName))
      )
  }

  // UPSCALE
  function upscaleDemoServices () {
    return mrKrabs.listClusters({ clusterName: 'demoCluster' })
    .then(clusters =>
      Promise.all(
        clusters.map(clusterName =>
          mrKrabs.upScaleAllStoppedServices({ clusterName, serviceName: 'demoServiceName' })
        )
      )
    )
  }


  // DOWNSCALE
  function downscaleDemoServices () {
    return mrKrabs.listClusters({ clusterName: 'demoCluster' })
      .then(clusters =>
        Promise.all(
          clusters.map(clusterName =>
            mrKrabs.downScaleAllRuningServices({ clusterName, serviceName: 'demoServiceName' })
          )
        )
      )
  }

  // Full flow of upscale and downscale all services of the defined clusters/services
  getDetailsOfDemoServices()
    .then(before => {
      console.log('--- BEFORE ---')
      console.log(before)
      return upscaleDemoServices()
    })
    .then(getDetailsOfDemoServices)
    .then(middle => {
      console.log('--- MIDDLE ---')
      console.log(middle)
      return downscaleDemoServices()
    })
    .then(getDetailsOfDemoServices)
    .then(after => {
      console.log('--- AFTER ---')
      console.log(after)
    })
  ```

  You can also mix settings by adding either the config file and supplying the config params, just keep in mind that the precendence order respectively function param and `krabs.json`.
