import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse'

import planets from './planets.mongo.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isHabitablePlanet = planet => {
  return planet.koi_disposition === 'CONFIRMED' 
        && planet.koi_insol > 0.36 
        && planet.koi_insol < 1.11
        && planet.koi_prad < 1.6
}

const getAllPlanets = async () => {
  return await planets.find({}, { '_id': 0, '__v': 0 })
}

const loadPlanetsData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', 'data', 'kepler_data.csv' ))
  .pipe(parse({
    comment: '#',
    columns: true,
  }))
  .on('data', async data => {
    if (isHabitablePlanet(data)) {
      // insert + update => upsert
      // upsert helps us to insert the document only if it doesn't exist otherwise update it
      savePlanet(data)
    }
  })
  .on('error', err => {
    console.log(err)
    reject(err)
  })
  .on('end', async () => {
    const countPlanetsFound = await getAllPlanets()
    console.log(`${countPlanetsFound.length} habitual planets are found.`)
    resolve()
    })
  })
}

const savePlanet = async (planet) => {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name,
    }, { 
      keplerName: planet.kepler_name 
    }, {
      upsert: true,
    })
  } catch (err) {
    console.error("Could not save planet: ", err);
  }
}

export { 
  loadPlanetsData,
  getAllPlanets,
}