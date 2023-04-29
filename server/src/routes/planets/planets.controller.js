import { getAllPlanets } from "../../models/planets.model.js"

const httpGetAllPlanets = async (req, res) => {
  return res.status(200).json(await getAllPlanets())
}

export { httpGetAllPlanets }