let mime = require('mime-types')

module.exports = function getContentType (file) {
  let bits = file.split('.')
  let last = bits[bits.length - 1]
  if (last === 'tsx') return 'text/tsx'
  if (last === 'ts') return 'text/typescript'

  // Fall back to octet-stream if not found by mime-types
  return mime.lookup(last) || 'application/octet-stream'
}
