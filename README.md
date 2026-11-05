# StudyFlow — Assignment Tracker

StudyFlow is a study planner built for DIT312 Assignment 06.
It helps students organize assignments and track deadlines.

## Features

- Create, edit, and delete assignments
- Three-column board: To do, In progress, Completed
- Start, complete, and reopen assignments
- Search by assignment title or course
- Filter by course and deadline
- Overdue indicators and completion progress
- Persistent MySQL storage
- Responsive layout

## Technology

- Next.js 16 and React
- MySQL 8.4 with mysql2
- Docker and Docker Compose
- phpMyAdmin

## Requirements

- Git
- Docker Engine and Docker Compose V2
- Available ports 8080 and 8081

## Run with Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/MoeHanKyaw01/studyflow.git
cd studyflow
```

### 2. Create a .env file

Create `.env` in the project root with these settings:

```env
MYSQL_ROOT_PASSWORD=REPLACE_WITH_A_STRONG_ROOT_PASSWORD
MYSQL_DATABASE=6703711_studyflow
MYSQL_USER=u6703711
MYSQL_PASSWORD=REPLACE_WITH_A_DIFFERENT_STRONG_PASSWORD
```

Replace both password placeholders before starting.
Do not commit `.env` or `.env.local` to GitHub.

Keep the database name consistent with `mysql/init/01-schema.sql`.

### 3. Build and start

```bash
docker compose up --build
```

Alternatively, run in the background:

```bash
docker compose up --build -d
```

### 4. Open the application

- StudyFlow: http://localhost:8080
- phpMyAdmin: http://localhost:8081

For phpMyAdmin, log in using `MYSQL_USER` and `MYSQL_PASSWORD`
from your `.env` file.

When using VirtualBox, forward host port 8080 to guest port 8080
and host port 8081 to guest port 8081.

## Useful commands

Check container status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs --tail=100 web mysql
```

Stop the application:

```bash
docker compose down
```

MySQL data is stored in the named `mysql_data` volume.
Normal container restarts and `docker compose down` preserve it.
Do not use `docker compose down -v` unless you intend to delete the data.

The SQL initialization script runs only when the database volume
is first created. It creates the table and sample assignments.
Existing CAMPP data is not automatically copied into Docker.

## Local development with CAMPP

Install dependencies:

```bash
npm ci
```

Create `.env.local`:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD="YOUR_CAMPP_PASSWORD"
DB_DATABASE=6703711_studyflow
```

Start CAMPP and import `mysql/init/01-schema.sql`
into its MySQL server once.

Start Next.js:

```bash
npm run dev
```

Open http://localhost:3000.

## Security note

This is an educational, single-user demo without authentication.
Run it locally or on a trusted private network.
Do not expose it publicly without adding access controls.

## Author

Moe Han Kyaw