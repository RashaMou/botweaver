# BotWeaver

A Node.js-based backend system for building and deploying chatbots with live
agent capabilities. Also includes a minimal frontend for demo purposes.

## Core Features

- Flow-based conversation engine
- Multi-platform message handling (just Telegram for now)
- Live agent handoff system
- Real-time updates via WebSocket
- Session and state management

## Tech Stack

- Node.js/Express/TypeScript
- MongoDB
- RabbitMQ
- Redis
- WebSocket

## Getting Started

```bash
npm install
cp .env.example .env
# Add your platform credentials to .env
npm run dev
```

## Project Structure

```
src/
├── backend/
│   ├── engine/     # Flow interpreter
│   ├── platforms/  # Platform integrations
│   ├── agent/      # Agent system
│   ├── models/     # Data models
│   └── api/        # REST endpoints
└── frontend/
├── config/     # Bot configuration UI
└── agent/      # Basic agent console
```

## API Documentation

### Bot Management

```typescript
POST /api/bots // Create new bot
GET /api/bots/:id // Get bot details
PUT /api/bots/:id // Update bot
DELETE /api/bots/:id // Delete bot

// Flow management
GET /api/bots/:id/flow // Get flow configuration
PUT /api/bots/:id/flow // Update flow
POST /api/bots/:id/validate // Validate flow
```

### Conversation Management

```typescript
GET /api/bots/:id/conversations // List bot conversations
GET /api/conversations/:id // Get conversation details
POST /api/conversations/:id/handoff // Initiate agent handoff
```

### Agent Interface

```typescript
GET /api/agent/conversations // List available conversations
PUT /api/agent/conversations/:id/claim // Claim conversation
POST /api/agent/conversations/:id/message // Send message
PUT /api/agent/conversations/:id/release // Release conversation
```

### Webhook Handlers

```typescript
POST /api/webhook/telegram/:botId // Telegram webhook endpoint
```

## Frontend

Minimal React implementation for:

- Bot configuration interface
- Basic agent console
- Real-time conversation view

## Development

Run tests: npm test
Lint: npm run lint
