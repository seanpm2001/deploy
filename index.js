let _inventory = require('@architect/inventory')
let awsLite = require('@aws-lite/client')
let { updater } = require('@architect/utils')
let cleanup = require('./src/utils/cleanup')

let direct = require('./src/direct')
let sam = require('./src/sam')
let _static = require('./src/static')

// eslint-disable-next-line
try { require('aws-sdk/lib/maintenance_mode_message').suppress = true }
catch { /* Noop */ }

function run (mod) {
  return function (options, callback) {
    let promise
    if (!callback) {
      promise = new Promise(function ugh (res, rej) {
        callback = function errback (err, result) {
          if (err) rej(err)
          else res(result)
        }
      })
    }

    // Always attempt to clean up after ourselves before exiting
    function clean (err, result) {
      cleanup()
      if (err) callback(err)
      else callback(null, result)
    }

    // Entered via CLI (or something that supplied inventory)
    if (options.inventory) {
      go(options.region || options.inventory.inv.aws.region)

    }
    else {
      _inventory({ env: true }, function (err, inventory) {
        if (err) callback(err)
        else {
          options.inventory = inventory
          go(options.region || inventory.inv.aws.region)
        }
      })
    }

    function go (region) {
      let params = { region }
      if (options.credentials) params.credentials = options.credentials
      awsLite(params)
        .then(aws => {
          mod({ ...options, aws, region, update: updater('Deploy') }, clean)
        })
        .catch(callback)
    }

    return promise
  }
}

module.exports = {
  direct: run(direct),
  sam:    run(sam),
  static: run(_static)
}
