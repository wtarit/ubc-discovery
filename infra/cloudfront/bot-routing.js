// CloudFront Function — Viewer Request
// Detects bot/crawler User-Agents on event pages and redirects them
// to the backend OG endpoint for rich link previews.
//
// Attach to the default behavior (viewer request event) of the
// CloudFront distribution that serves the frontend static site.

var BACKEND_OG_ORIGIN = 'https://ub-967422f2210d40eb885a3c12187c402d.ecs.us-west-2.on.aws';

var BOT_PATTERNS = [
  'facebookexternalhit',
  'facebookcatalog',
  'twitterbot',
  'linkedinbot',
  'slackbot-linkexpanding',
  'slackbot',
  'discordbot',
  'telegrambot',
  'whatsapp',
  'applebot',
  'googlebot',
  'bingbot',
  'yandexbot',
  'baiduspider',
  'duckduckbot',
  'redditbot',
  'rogerbot',
  'embedly',
  'quora link preview',
  'pinterestbot',
  'vkshare',
  'outbrain',
  'w3c_validator',
  'kakaotalk-scrap',
  'naverbot',
  'seznambot',
  'ia_archiver',
];

function isBot(userAgent) {
  var ua = userAgent.toLowerCase();
  for (var i = 0; i < BOT_PATTERNS.length; i++) {
    if (ua.indexOf(BOT_PATTERNS[i]) !== -1) {
      return true;
    }
  }
  return false;
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  var match = uri.match(/^\/events\/([A-Za-z0-9_-]+)\/?$/);
  if (!match) {
    return request;
  }

  var userAgent = request.headers['user-agent']
    ? request.headers['user-agent'].value
    : '';

  if (!isBot(userAgent)) {
    return request;
  }

  return {
    statusCode: 302,
    statusDescription: 'Found',
    headers: {
      location: {
        value: BACKEND_OG_ORIGIN + '/og/events/' + match[1],
      },
    },
  };
}
