import axios from 'axios'

import launches from './launches.mongo.js'
import planets from './planets.mongo.js'

const DEFAULT_FLIGHT_NUMBER = 100

const saveLaunch = async launch => {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber
    },
    launch,
    {
      upsert: true
    }
  )
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v5/launches/query'

const populateLaunches = async () => {
  const res = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]
    }
  })

  if (res.status !== 200) {
    console.log('Problem downloading launch data')
    throw new Error('Launch data download failed')
  }
  
  const launchDocs = res.data.docs

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads']
    const customers = payloads.flatMap(payload => {
      return payload.customers
    })

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers
    }

    await saveLaunch(launch)
  }
}

const loadLaunchData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })
  
  if (firstLaunch) {
    console.log('launch data alreay loaded')
  } else {
    await populateLaunches()
  }
}

const findLaunch = async filter => {
  return await launches.findOne(filter)
}

const existsLaunch = async id => {
  return await findLaunch({ flightNumber: id })
}

const getLatestFlightNumber = async () => {
  const latestLaunch = await launches.findOne().sort('-flightNumber')

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER
  }

  return latestLaunch?.flightNumber
}

const getAllLaunches = async (limit, skip) => {
  return await launches.find({}, { _id: 0, __v: 0 })
  .sort({ flightNumber: 1 })
  .skip(skip)
  .limit(limit)
}

const scheduleNewLaunch = async launch => {
  const planet = await planets.findOne({ keplerName: launch.target })

  if (!planet) {
    throw new Error('No matching planet found')
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    cusotmers: ['ZTM', 'NASA'],
    flightNumber: newFlightNumber
  })

  await saveLaunch(newLaunch)
}

const abortLaunch = async id => {
  const aborted = await launches.updateOne(
    {
      flightNumber: id
    },
    {
      upcoming: false,
      success: false
    }
  )

  return aborted.modifiedCount === 1
}

export {
  loadLaunchData,
  existsLaunch,
  getAllLaunches,
  abortLaunch,
  scheduleNewLaunch
}
