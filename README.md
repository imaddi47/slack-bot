# Slack Bot

A Slack bot application built to automate tasks and enhance team communication.

## Overview

This project provides a Slack bot that integrates with your Slack workspace to handle automated workflows and messaging.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Slack workspace and bot token
- Slack App credentials (Bot Token, Signing Secret)

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

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
```

## Running the Bot

Start the bot with:
```bash
npm start
```

For development mode with auto-reload:
```bash
npm run dev
```

## Docker Setup

### Build the Docker image:
```bash
docker build -t slack-bot .
```

### Run with Docker:
```bash
docker run --env-file .env slack-bot
```

### Using Docker Compose:
```bash
docker-compose up
```

Ensure you have a `Dockerfile` and `docker-compose.yml` in the root directory.

## Use Cases

- Automate routine notifications and alerts
- Handle user queries and provide responses
- Integrate with external APIs for data retrieval
- Post scheduled messages and updates

## Project Structure

```
slack-bot/
├── src/
│   ├── index.ts       # Entry point
│   └── handlers/      # Event handlers
├── .env               # Environment variables
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```
