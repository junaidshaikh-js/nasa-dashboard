import express from 'express'

import { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch } from './launches.controller.js'

const router = express.Router()

router.get('/', httpGetAllLaunches)
router.post('/', httpAddNewLaunch)
router.delete('/:id', httpAbortLaunch)

export default router