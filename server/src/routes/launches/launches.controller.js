import { getAllLaunches, existsLaunch, abortLaunch, scheduleNewLaunch } from '../../models/launches.model.js'
import { getPagination } from '../../services/query.js'

const httpGetAllLaunches = async (req, res) => {
  const { limit, skip } = getPagination(req.query)
  const launches = await getAllLaunches(limit, skip)
  return res.status(200).json(launches)
}

const httpAddNewLaunch = async (req, res) => {
  const launch = req.body

  if (
    !launch.mission || 
    !launch.rocket || 
    !launch.launchDate ||
    !launch.target){
      return res.status(400).json({
        error: 'Missing required launch properties',
      })
    }

  launch.launchDate = new Date(launch.launchDate)
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date'
    })
  }

  await scheduleNewLaunch(launch)
  return res.status(201).json({ launch })
}

const httpAbortLaunch = async (req, res) => {
  const launchId = Number(req.params.id)

  const existLaunch = await existsLaunch(launchId)

  if (!existLaunch) {
    return res.status(404).json({
      error: 'launch not found',
    })
  }
 
  const aborted = await abortLaunch(launchId)

  if (!aborted) {
    return res.status(400).json({ error: "Launch not aborted" })
  } 

  return res.status(200).json({ ok: true })
}

export {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
}