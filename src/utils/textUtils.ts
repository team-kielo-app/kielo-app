export const robustWordTokenizer = (
  text: string
): { word: string; spaceAfter: string }[] => {
  if (!text) return []
  const results: { word: string; spaceAfter: string }[] = []

  try {
    // First try to identify URLs and email addresses to preserve them
    const urlEmailRegex =
      /((?:https?:\/\/)?(?:www\.)?[\p{L}\p{N}][\p{L}\p{N}_\-]*(?:\.[\p{L}\p{N}][\p{L}\p{N}_\-]*)+(?:\/[^\s]*)?|[\p{L}\p{N}][\p{L}\p{N}._\-]*@[\p{L}\p{N}][\p{L}\p{N}_\-]*(?:\.[\p{L}\p{N}][\p{L}\p{N}_\-]*)+)(\s*)|([^\s]+)(\s*)/gu

    let match
    let lastIndex = 0
    let textToProcess = text

    // First pass: extract URLs and emails
    while ((match = urlEmailRegex.exec(text)) !== null) {
      if (match[1]) {
        // This is a URL or email
        results.push({ word: match[1], spaceAfter: match[2] || '' })
        const matchedLength = match[0].length
        const startPos = match.index
        const endPos = startPos + matchedLength
        lastIndex = endPos
      } else if (match[3]) {
        // This is other text
        // Process remaining text with our regular tokenizer
        const fragment = match[3]
        const spaces = match[4] || ''

        // Process normal words with trailing punctuation
        const wordRegex =
          /([\p{L}\p{N}\p{M}'-]+[,.'\-"]*|[^\s\p{L}\p{N}\p{M}]+)/gu
        let wordMatch
        let subResults: { word: string; spaceAfter: string }[] = []

        while ((wordMatch = wordRegex.exec(fragment)) !== null) {
          if (wordMatch[0]) {
            subResults.push({ word: wordMatch[0], spaceAfter: '' })
          }
        }

        // Add the last space to the last subresult if there are any
        if (subResults.length > 0) {
          subResults[subResults.length - 1].spaceAfter = spaces
          results.push(...subResults)
        } else {
          // Just in case something went wrong with regex
          results.push({ word: fragment, spaceAfter: spaces })
        }
      }
    }

    // If no URL/email matches were found, process the whole text with the standard tokenizer
    if (results.length === 0) {
      const wordRegex =
        /([\p{L}\p{N}\p{M}'-]+[,.'\-"]*|[^\s\p{L}\p{N}\p{M}]+)(\s*)/gu
      while ((match = wordRegex.exec(text)) !== null) {
        if (match[1]) {
          results.push({ word: match[1], spaceAfter: match[2] || '' })
        } else if (match[2]) {
          results.push({ word: '', spaceAfter: match[2] })
        }
      }
    }
  } catch (e) {
    // Fallback if Unicode properties are not supported (older JS engines, though unlikely in modern RN)
    console.warn(
      'Unicode property escapes for regex not fully supported. Falling back to simpler tokenizer.',
      e
    )

    // Modified fallback pattern to better handle URLs and trailing punctuation
    const finnishWordChars = "A-Za-z0-9_ÄäÖöÅå'-"
    const fallbackRegex = new RegExp(
      `((?:https?:\\/\\/)?(?:www\\.)?[${finnishWordChars}][${finnishWordChars}]*(?:\\.[${finnishWordChars}][${finnishWordChars}]*)+(?:\\/[^\\s]*)?|[${finnishWordChars}]+[,.'\-"]*|[^\\s${finnishWordChars}]+)(\\s*)`,
      'gu'
    )

    let match
    while ((match = fallbackRegex.exec(text)) !== null) {
      if (match[1]) {
        results.push({ word: match[1], spaceAfter: match[2] || '' })
      } else if (match[2]) {
        results.push({ word: '', spaceAfter: match[2] })
      }
    }
  }

  // If regex produced no results but text exists (e.g., all symbols not caught by patterns)
  if (results.length === 0 && text.length > 0) {
    return [{ word: text, spaceAfter: '' }] // Treat as a single block
  }

  return results
}
