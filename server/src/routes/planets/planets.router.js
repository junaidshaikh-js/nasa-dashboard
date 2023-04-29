import express from 'express'

import { httpGetAllPlanets } from './planets.controller.js'

const router = express.Router()

router.get('/', httpGetAllPlanets)

export default router 