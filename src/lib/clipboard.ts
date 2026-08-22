/**
 * Safe clipboard copy utility with fallback for non-secure contexts (HTTP, local LAN IPs)
 * Returns a boolean indicating whether the text was successfully copied.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !text) {
    return false
  }

  // 1. Try Modern Navigator Clipboard API (works on HTTPS & localhost)
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fallback below if permission was denied or failed
    }
  }

  // 2. Fallback to hidden textarea with document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text

    // Prevent scrolling to bottom
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.setAttribute('readonly', '')

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    return successful
  } catch (err) {
    console.error('Failed to copy text using fallback:', err)
    return false
  }
}
