export function validateMathExpression(expr: string): boolean {
  // Remove whitespace
  expr = expr.trim();
  
  // Skip validation for empty expressions
  if (!expr) return true;
  
  // Check for basic LaTeX syntax errors
  const errors = [
    // Unmatched braces
    { regex: /\{[^}]*$/, message: 'Unmatched {' },
    { regex: /^[^{]*}/, message: 'Unmatched }' },
    // Unmatched brackets
    { regex: /\[[^\]]*$/, message: 'Unmatched [' },
    { regex: /^[^\[]*]/, message: 'Unmatched ]' },
    // Invalid characters in subscripts/superscripts
    { regex: /[_^]{2,}/, message: 'Invalid repeated _ or ^' },
    // Common syntax errors
    { regex: /\\[a-zA-Z]+[^a-zA-Z\s{]/, message: 'Invalid command syntax' },
    // Check for unescaped special characters
    { regex: /(?<!\\)[#%&]/, message: 'Unescaped special character' },
  ];

  for (const { regex, message } of errors) {
    if (regex.test(expr)) {
      throw new Error(message);
    }
  }

  // Check for balanced delimiters
  let braceCount = 0, bracketCount = 0;
  for (const char of expr) {
    if (char === '{' && expr[expr.indexOf(char) - 1] !== '\\') braceCount++;
    if (char === '}' && expr[expr.indexOf(char) - 1] !== '\\') braceCount--;
    if (char === '[' && expr[expr.indexOf(char) - 1] !== '\\') bracketCount++;
    if (char === ']' && expr[expr.indexOf(char) - 1] !== '\\') bracketCount--;
    if (braceCount < 0) throw new Error('Unmatched }');
    if (bracketCount < 0) throw new Error('Unmatched ]');
  }
  if (braceCount > 0) throw new Error('Unmatched {');
  if (bracketCount > 0) throw new Error('Unmatched [');

  return true;
}