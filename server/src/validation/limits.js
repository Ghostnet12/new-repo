// Match HTML maxLength and JavaScript string length throughout the application.
export const TEXT_LIMIT = 25_000;
export const TEXT_LIMIT_LABEL = '25,000';
export const TEXT_LIMIT_MESSAGE = 'Please keep each text field to 25,000 characters or fewer.';

export function checkTextLimits(value) {
  if (typeof value === 'string' && value.length > TEXT_LIMIT) throw new Error(TEXT_LIMIT_MESSAGE);
  if (value && typeof value === 'object') Object.values(value).forEach(checkTextLimits);
}
