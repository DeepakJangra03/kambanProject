# Forge 2 · Edition 1 Qualifier — Tiny Kanban Board

A lightweight Trello-style Kanban board built with **Laravel** and **React**, created through a two-agent development workflow using **OpenClaw** and **Hermes** over Slack.

## Overview

This project demonstrates a collaborative AI-assisted development workflow while delivering a functional Kanban application.

### Features

* Create and manage boards
* Create lists within boards (To-Do, Doing, Done, etc.)
* Create and edit cards
* Move cards between lists
* Assign members to boards
* Set card descriptions and due dates
* Basic tag management API

## Tech Stack

| Layer           | Technology                                |
| --------------- | ----------------------------------------- |
| Frontend        | React, Vite                               |
| Backend         | Laravel 13, PHP 8.3                       |
| Database        | SQLite                                    |
| Agent Framework | OpenClaw                                  |
| Coordination    | Slack Socket Mode                         |
| Primary Model   | Gemini 2.5 Flash                          |
| Fallback Models | Groq Llama 3.3 70B, Ollama Qwen 2.5 Coder |

## AI Workflow

Development was performed through a two-agent setup:

* **Hermes (Brain Agent)** — Planning, task breakdown, memory, and coordination
* **OpenClaw (Hands Agent)** — Code generation, implementation, and project modifications

Model routing prioritized Gemini 2.5 Flash due to its large context window and generous free-tier limits. Groq and Ollama were configured as fallbacks when quota limits were reached.

## Local Setup

### Backend

```bash
cd kanban/backend

composer install
cp .env.example .env

php artisan key:generate
php artisan migrate

php artisan serve
```

Backend runs at:

```text
http://localhost:8000
```

API endpoint:

```text
http://localhost:8000/api
```

### Frontend

```bash
cd kanban/frontend

npm install
npm run dev
```

Frontend runs at:

```text
https://deepakjangra-kanban.vercel.app/
```

### OpenClaw Agent Setup

```bash
npm install -g openclaw@latest

openclaw onboard

openclaw plugins install @openclaw/slack

openclaw gateway
```

Required environment variables:

```env
SLACK_APP_TOKEN=
SLACK_BOT_TOKEN=
GEMINI_API_KEY=
GROQ_API_KEY=
```

See `openclaw.json` and `.env.example` for configuration details.

## Live Demo

Frontend:

https://forge2-xi.vercel.app/

Backend API:

https://forge2-1.onrender.com

## Repository Structure

```text
.
├── README.md
├── ARCHITECTURE.md
├── agent-log.md
├── slack-export/
├── skills/
│   └── status-report/
│       └── SKILL.md
├── openclaw.json
├── .env.example
└── kanban/
    ├── backend/
    └── frontend/
```

## Known Limitations

The qualifier emphasizes transparency, so the following items are intentionally documented:

### Tags

Tag creation and retrieval endpoints are implemented:

```text
GET  /api/tags
POST /api/tags
```

However, card-to-tag relationships and attach/detach functionality remain incomplete.

### Card Member Assignment

The database supports card assignment through the `member_id` field, but full end-to-end validation through the UI has not been exhaustively tested.

### Hermes Agent Verification

Hermes setup was partially completed, but memory persistence, custom SKILL execution, and autonomous scheduled workflows were not fully verified before submission.

### Additional Testing

Board and list creation were tested extensively. Update and delete operations have not undergone comprehensive validation.

## Notes

This project was built entirely using free-tier tooling and APIs. No paid models, subscriptions, or hosted AI services were used during development.
