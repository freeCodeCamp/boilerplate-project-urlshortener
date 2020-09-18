# API Project: URL Shortener Microservice for freeCodeCamp

[![Run on Repl.it](https://repl.it/badge/github/freeCodeCamp/boilerplate-project-urlshortener)](https://repl.it/github/freeCodeCamp/boilerplate-project-urlshortener)

### User Stories

1. You should provide your own project, not the example URL.
2. You can POST a URL to `/api/shorturl/new` and get a JSON response with the property names `original_url` and `short_url` and the expected values for each.
3. When you visit `/api/shorturl/<short_url>`, you will be redirected to the original URL.
4. If you pass an invalid URL that doesn't follow the valid `http://www.example.com` format, the JSON response will contain `{ 'error': 'invalid url' }`.
