import { Emojis } from "./emojis";

// Helper function to remove indentation
export function noIndent(strings: TemplateStringsArray, ...values: any[]) {
  const result = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] || '');
  }, '');
  
  return result
    .replace(/^\s+/gm, '')
    .replace(/\)/g, Emojis.arrow)
    .trim();
}