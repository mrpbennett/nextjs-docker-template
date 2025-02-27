/**
 * Debug utility to log objects with better formatting
 * @param {string} label - Label for the debug output
 * @param {any} data - Data to log
 */
export function debugLog(label, data) {
  console.log(`----- DEBUG ${label} -----`)
  console.log(JSON.stringify(data, null, 2))
  console.log(`----- END ${label} -----`)
  return data // Return the data to allow for chaining
}
