/**
 * Truncates and formats a display name.
 *
 * @param {string} fullName – the raw name (e.g. userState?.displayName)
 * @param {object} [options]
 * @param {number} [options.maxLen=12] – maximum allowed characters before truncation
 * @param {string} [options.ellipsis='…'] – character(s) to append on truncation
 * @returns {string} – formatted name
 */
export function nameParser(fullName, options = {}) {
  const { maxLen = 10, ellipsis = '…' } = options
  if (typeof fullName !== 'string') return ''

  // Clean up whitespace
  const parts = fullName.trim().split(/\s+/).filter(Boolean)

  let result = ''

  for (let i = 0; i < parts.length; i++) {
    const word = parts[i]
    const candidate = result ? `${result} ${word}` : word

    // First word too long: slice it and append ellipsis
    if (i === 0 && word.length > maxLen) {
      const sliced = word.slice(0, maxLen)
      result = sliced + ellipsis
      break
    }

    // Adding next word would exceed maxLen? truncate now
    if (candidate.length > maxLen) {
      result = result + ellipsis
      break
    }

    // Otherwise, accept this word
    result = candidate
  }

  // Capitalize first character (if there is one)
  if (result) {
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }

  return result
}
