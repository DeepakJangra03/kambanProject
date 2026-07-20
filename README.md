# Kanban Project

A full-stack Kanban board application with Laravel backend and React frontend.

## Project Structure

- `/kanban/backend` - Laravel 13 API (PHP 8.3)
- `/kanban/frontend` - React + Vite frontend with Tailwind CSS

## Features

- Board management
- Lists (columns) within boards
- Cards with tags and members
- Drag-and-drop functionality (planned)
- Member assignment
- Tag management

## Tech Stack

**Backend:**
- Laravel 13
- PHP 8.3
- MySQL/SQLite

**Frontend:**
- React 19
- Vite 8
- Tailwind CSS 4

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel with separate deployments:

1. **Frontend** (React + Vite): Deploy from `/kanban/frontend`
2. **Backend** (Laravel API): Requires PHP hosting (not Vercel) - consider Railway, Heroku, or DigitalOcean

### Setup Instructions

1. Clone the repository
```bash
git clone <your-repo-url>
cd myProject
```

2. Backend Setup
```bash
cd kanban/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

3. Frontend Setup
```bash
cd kanban/frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` files in both backend and frontend directories.

## License

MIT
