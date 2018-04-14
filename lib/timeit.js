/**
 * @module
 *
 * Utility module for measuring execution time of operations.
 */

let timers = {}
let measurements = {}

module.exports = {
  /**
   * Start a stopwatch with the given label.
   *
   * @param {String} label - the name of the stopwatch
   */
  start: label => {
    timers[label] = process.hrtime()
  },

  /**
   * End a stopwatch with the given label.
   *
   * @param {String} label - the name of the stopwatch to stop
   * @return {Number} the number of milliseconds measured by the
   *  stopwatch
   */
  end: label => {
    const diff = process.hrtime(timers[label])
    const ms = diff[0] * 1000 + diff[1] / 1000000

    measurements[label] = ms
    return ms
  },

  /**
   * Get a report of previously measured values.
   *
   * Note: This will reset the measurement history.
   *
   * @return {Object} - a map of label <> milliseconds for the
   *  measured values
   */
  report: () => {
    const m = measurements
    measurements = {}
    return m
  }
}
