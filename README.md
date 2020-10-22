# Scheduler Demo

This demo API and UI attempts to implement the stakeholder intentions, user stories, and technical requirements described below. It is, at its most abstract, an implementation of the API specification provided in `server/api.spec.yml`, which is a RESTful API design that strives to comply with OpenAPI 3.0 standards. (To see a pretty UI for this specification, paste the contents into https://editor.swagger.io/)

This project has three major components:

* A MySQL database whose schema are contained in `server/data`
* An Express.js server whose implementation can be found in `server/`
* A React app whose implementation can be found in `web/`

The Express.js app servers both the API routes as well as the Web interface at the same port (default `3100`). The single-page app is accessed at the `/` endpoint while API routes are namespaced via `/api/` (e.g., `/api/events`, `/api/users`, etc.). Eventually, these implementations will need to be segregated for scaling.

## Getting started

The entire system can be run with two processes: one for the database, and another for the integrated Web and API servers.

### Running locally with Docker Compose

If you are familiar with Docker and have both `docker` and `docker-compose` installed, you can spin up everything by running

`$ docker-compose up --force-recrete --build`

at the project root, which also contains the `docker-compose.yml` file. The `--force-recreate` and `--build` flags are not necessary but can be useful for development and debugging purposes when images and containers are expected to be rebuilt with changes.

Once things have finished initializing, you should be able access the Web app at http://localhost:3100 and hit various API endpoints with any given client.

NOTE: You can still run the React Development Server as you normally would via `npm start` and access the UI via http://localhost:3000; it should connect to the MySQL server that Docker Compose spun up.

### Running and developing locally with Node.js and MySQL

If you already have a MySQL server and feel brave enough to let an unknown demo connect to it, you can supply the appropriate configuration via the environment variables outlined in `.env`. Then, you can either build the React app and access the built Web application via the integrated server, or you can run the React Development Server and access the Web application via https://localhost:3000.

## Project management

### Stakeholder Intentions

The following information has been provided by relevant stakeholders, and all requirements have been derived from these stakeholder intentions.

* "You will be building a JSON REST API. The endpoints and returned data can be of your own choosing. API design is part of the challenge, so think carefully about your routes and how you decide to return data."
* "You can expect to be given a list of user ids and a time range as part of the API request."
* "Find times where users could meet given user ids and a time range, without considering working hours."
* "Find times where users could meet given user ids and a time range, within their working hours."
* "Construct an appropriate JSON response body that you think best represents the data."
  * "`user_id` is the user's id"
  * "`time_zone` is the user's IANA timezone"
  * "`working_hours` are the hours that the user has set that they will be in the office. Usually the working hours of someone in the US are from 9 am - 5 pm, for example."
  * "`events` is a list of the user's events. All datetimes are represented in ISO 8601 format with a GMT timezone"

### User Stories

The stakeholder intentions above can be described in terms of user stories for project management purposes. User stories involve high-level descriptions of functionality from the perspective of product owners and end users.

|Name|Description
|---|---
|STORY-1|As a user, I would like to select a list of users of any timezone and compare their availability for new events.
|STORY-2|As a user, I would like to see the results as a list of available time ranges.
|STORY-3|As a user, I would like to be able to toggle whether or not the above schedule takes each user's working hours into consideration.

### API Technical Requirements Breakdown

The above user stories can be further decomposed into technical requirements for the API. The requirements that follow break the user stories and stakeholder intentions down into well-formed requirements that can be implemented to specification. This technical specification complements user stories by describing the product in terms of concrete functionality and providing the context for, e.g., user story acceptance criteria.

|Name|Description
|---|---
|API-1|The API is a JSON REST API and MUST therefore return responses of type `application/json`.
|API-2|Endpoints and the structure and content of responses are beyond the scope of these requirements, but they SHOULD be designed with API best practices in mind.
|API-3|The API MUST be able to accept a request with content containing user ids, a time range, and an optional flag for filtering by working hours.
|API-4|The API MUST be able to accept the content provided per API-3 and return a response containing time ranges where the users specified by their user ids could meet, whether during working hours or not.
|API-5|The structure and content of the API response is beyond the scope of this specification, but the response SHOULD contain the following fields: `user_id` for the user's id, `time_zone` for the user's IANA timezone, `working_hours` for the time range during which the user will be in the office, and `events` as a list of the user's events.
|API-6|All datetimes are represented in ISO 8601 format with a GMT timezone.


### Next To Do

|Status|Description
|---|---
|❌|Implement real logging with `winston` or `morgan`; secure logging by not logging debug output in production
|❌|Implement authentication logic (perhaps OAuth 2.0 or integration with, e.g., Google calendar)
|❌|Implement database access control/per-environment configuration
|✅|Integrate OpenAPI validation middleware into Express.js app server
|✅|Implement API endpoint schema request validation
|❌|Implement API endpoint schema response validation
|❌|Implement automated testing of RESTful endpoints for schema validation
|❌|Implement end-to-end tests for various typical use-cases
|✅|Improve interval analysis algorithm for clarity/readability and performance
|❌|Improve data models and update specifications accordingly
|❌|Create more generic utilities to keep code DRY
|❌|Went with FullCalendar because it supports and integrates easily with event abstractions, but it may be better to implement own calendar or use React-focused alternative
|❌|GET /events filter by user_ids
|❌|Full OpenAPI 3.0 support
|❌|Further distinguish and separate individual application domains, e.g. events versus time ranges, etc.
|❌|More time on React app design (components, views, data contexts, etc.)