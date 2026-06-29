# URL Shortener Microservice

A URL Shortener Microservice built with **Node.js** and **Express.js** as part of the freeCodeCamp Back End Development and APIs certification.

## Features

* Shortens valid HTTP/HTTPS URLs.
* Validates URLs using DNS lookup.
* Redirects users from the shortened URL to the original URL.
* Returns an error for invalid URLs.

## API Endpoints

### Create a Short URL

**POST**

```http
/api/shorturl
```

**Request Body**

```text
url=https://www.google.com
```

**Response**

```json
{
  "original_url": "https://www.google.com",
  "short_url": 1
}
```

### Redirect to Original URL

**GET**

```http
/api/shorturl/:short_url
```

Example:

```http
/api/shorturl/1
```

This redirects the user to the original URL.

### Invalid URL Response

```json
{
  "error": "invalid url"
}
```

## Technologies Used

* Node.js
* Express.js
* CORS
* DNS Module

## Installation

```bash
git clone <repository-url>
cd boilerplate-project-urlshortener
npm install
npm start
```

The application will run at:

```text
http://localhost:3000
```

## Author

Saurabh Singh
