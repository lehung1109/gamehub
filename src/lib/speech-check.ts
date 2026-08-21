/**
 * Check if the current browser environment supports the Web Speech API (speechSynthesis).
 * Wrapped in try-catch to prevent crashes in restricted iframe / WebView contexts.
 */
export function isSpeechSupported(): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }
    return (
      "speechSynthesis" in window &&
      Boolean(window.speechSynthesis) &&
      "SpeechSynthesisUtterance" in window &&
      Boolean(window.SpeechSynthesisUtterance)
    );
  } catch {
    return false;
  }
}
