import { slugify } from 'transliteration';

/**
 * Translates a given text to English using a free Google Translate endpoint.
 * Falls back to the original text if translation fails.
 */
async function translateToEnglish(text: string): Promise<string> {
  if (!text.trim()) return '';
  
  // Check if text is likely not English (very basic check for non-ASCII)
  const isNonEnglish = /[^\x00-\x7F]/.test(text);
  if (!isNonEnglish) return text;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Google Translate structure: [[["translated text", "original text", ...]]]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

/**
 * Generates an SEO-friendly slug from a title, translating it to English first if needed.
 */
export async function generateSlugFromTitle(title: string): Promise<string> {
  const translated = await translateToEnglish(title);
  
  return slugify(translated)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
