# Slack Bot

A Slack bot application built to automate tasks and enhance team communication.

## Overview

This project implements a Slack bot using `@slack/bolt`. It registers command, event and interactive handlers and exposes HTTP endpoints for Slack to call.

## Prerequisites

- Node.js (v16+ recommended)
- npm (comes with Node.js) or Yarn
- A Slack workspace and a Slack App with the following credentials:
	- `SLACK_OAUTH_TOKEN` (bot token, xoxb-...)
	- `SLACK_SIGNING_SECRET`

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd slack-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
Create a `.env` file in the project root or copy from a template if provided:

```
# Example .env
SLACK_OAUTH_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
PORT=3000
```

Put real values from your Slack App configuration into `.env`.

## Running the Bot

- Start the bot:
```bash
npm start
```

- Development with auto-reload (if configured):
```bash
npm run dev
```

- Run tests (if any):
```bash
npm test
```

Notes:
- The application entrypoint is `src/server.js` which creates an `ExpressReceiver` and an `App` from `@slack/bolt`.
- The app exposes the following endpoints via the receiver by default (see `src/server.js`):
	- `/slack/commands` — for slash commands
	- `/slack/events` — Events API
	- `/slack/interactive` — actions, options, view submissions, shortcuts

You do not need separate endpoints for `app.view()`, `app.action()`, `app.options()`, or `app.shortcut()` — they all go to the interactive endpoint.

## Interactive handlers and timeouts

- If you use `external_select` (dynamic options) you MUST respond to Slack within 3 seconds in your `app.options()` handler. If your backend takes longer (5–10s) consider:
	- Caching the options and responding from cache
	- Opening a modal to collect user input instead of `external_select`
	- Returning quick placeholder options and updating the workflow later

## Docker

Build the Docker image:
```bash
docker build -t slack-bot .
```

Run the container (passing the `.env` file):
```bash
docker run --env-file .env -p 3000:3000 slack-bot
```

Using Docker Compose:
```bash
docker-compose up
```

Note: Verify the Dockerfile `CMD` or `ENTRYPOINT` points to the correct entry file (`src/server.js`) or uses `npm start`. Update the Dockerfile if it references a different file.

## Project Structure

```
slack-bot/
├── src/
│   ├── server.js            # App entrypoint (creates ExpressReceiver + App)
│   ├── test.js              # Local test/demo handlers
│   ├── commands/            # Slash command handlers (registered by src/commands/__index.js)
│   ├── events/              # Event handlers (registered by src/events/__index.js)
│   └── interactives/        # Interactive handlers (registered by src/interactives/__index.js)
├── .env.template            # Example env variables (if present)
├── package.json             # npm scripts and dependencies
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Adding handlers

- Add new command/event/interactive modules under `src/commands`, `src/events`, or `src/interactives` following the current pattern. Each module should export an `init(app)` or default export that accepts the `app` instance and registers listeners.
- There's a loader in each folder (`__index.js`) that imports and registers the handlers. See the existing files for the exact export shape.

## Troubleshooting

- If you see schema validation errors when opening modals (e.g. `invalid_arguments`), ensure modal blocks use `type: 'input'` for form fields and that `label` belongs to `input` blocks, not `section` blocks.
- For `external_select` option loading, keep the `app.options()` handler fast (<3s) or use caching/modal workarounds.

If you want, I can also:
- Update the `Dockerfile` to use `npm start` and point to `src/server.js`.
- Add a `.env.template` file with required variables.

