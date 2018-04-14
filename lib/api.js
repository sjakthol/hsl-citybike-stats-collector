const request = require('request-promise-native')

const API = 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql'
const QUERY = `query {
  bikeRentalStations {
    stationId, name, bikesAvailable, spacesAvailable, state, realtime
  }
}`

/**
 * @typedef CityBikeStationStatistics
 * @prop {String} StationId - the id of the station
 * @prop {String} StationName - the name of the station
 * @prop {Number} BikesAvailable - the number of bikes available at the station
 * @prop {Number} SpacesAvailable - the number of free spaces at the station
 * @prop {Boolean} Realtime - whether the information is estimate or accurate measurement
 * @prop {String} Timestamp - the time these stats were collected
 */

module.exports = {
  /**
   * Query the Digitransit API to fetch citybike availability statistics
   * @async
   *
   * @return {Promise<CityBikeStationStatistics[]>}
   */
  fetchStats: async () => {
    const data = await request.post(API, { json: true, body: { query: QUERY, variables: null } })

    const Timestamp = (new Date()).toISOString()
    return data.data.bikeRentalStations.map(entry => ({
      BikesAvailable: entry.bikesAvailable,
      Realtime: entry.realtime,
      SpacesAvailable: entry.spacesAvailable,
      StationId: entry.stationId,
      StationName: entry.name,
      Timestamp
    }))
  }
}
