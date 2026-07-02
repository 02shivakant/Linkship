const { nanoid } = require('nanoid');
const validator = require('validator');

const generateShortCode = (length = 6) => {
  return nanoid(length);
};

const isValidUrl = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  });
};

const isValidAlias = (alias) => {
  // Only allow alphanumeric and hyphens, 3-20 chars
  return /^[a-zA-Z0-9-]{3,20}$/.test(alias);
};

const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

module.exports = { generateShortCode, isValidUrl, isValidAlias, getClientIp };
