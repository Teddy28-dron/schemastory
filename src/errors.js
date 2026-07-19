export class SchemaStoryError extends Error {
  constructor(code, message, hint, options = {}) {
    super(message, options);
    this.name = 'SchemaStoryError';
    this.code = code;
    this.hint = hint;
  }
}

export function formatUserError(error) {
  if (error instanceof SchemaStoryError) {
    return [`Error [${error.code}]: ${error.message}`, `How to fix: ${error.hint}`].join('\n');
  }

  return [
    `Error [UNEXPECTED]: ${error instanceof Error ? error.message : String(error)}`,
    'How to fix: re-run with valid inputs. If this persists, open a bug report with the command and Node.js version.',
  ].join('\n');
}
