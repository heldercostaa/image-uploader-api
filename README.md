<div align="center">

![Language](https://img.shields.io/badge/language-typescript-yellow?logo=typescript&logoColor=white)
[![Node](https://img.shields.io/badge/node-222?logo=node.js&logoColor=5FA04E)](https://nodejs.org/en)
[![Fastify](https://img.shields.io/badge/fastify-222?logo=fastify&logoColor=white)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/postgresql-222?logo=postgresql&logoColor=4169E1)](https://www.postgresql.org)
[![Drizzle](https://img.shields.io/badge/drizzle-222?logo=drizzle&logoColor=C5F74F)](https://orm.drizzle.team)
[![Maintainer](https://img.shields.io/badge/maintainer-%40heldercostaa-teal?logo=superuser&logoColor=white)](https://github.com/heldercostaa)
[![LinkedIn](https://img.shields.io/badge/linkedin-blue.svg?logo=linkedin)](https://linkedin.com/in/heldercostaa/)

<br />
<a href="#about-the-project">
  <img src="./docs/favicon.svg" alt="Logo" width="80" height="80">
</a>
<h3 align="center" style="font-size: 3em;">Image Uploader API</h3>
<p align="center">
  Backend API for uploading image files, storing metadata, and exporting upload reports.
  <br />
  <a href="#local-setup-instructions"><strong>Run the project locally »</strong></a>
  <br />
  <br />
  <a href="https://github.com/heldercostaa/image-uploader">Application Repository</a>
  ·
  <a href="#api-reference">API Reference</a>
</p>
</div>

> [!NOTE]
> This API is designed to support the Image Uploader frontend. By default, the frontend expects the upload endpoint at `http://localhost:3333/uploads`.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#features">Features</a>
    </li>
    <li>
      <a href="#local-setup-instructions">Local Setup Instructions</a>
    </li>
    <li>
      <a href="#api-reference">API Reference</a>
    </li>
    <li>
      <a href="#tests">Tests</a>
    </li>
    <li>
      <a href="#extra-commands">Extra Commands</a>
    </li>
  </ol>
</details>

## About The Project

<div align="center">
  <img src="./docs/1. Uploading.gif" alt="Image Uploader screenshot" style="width: 95%; border-radius: 5px;"/>
</div>
<br />

This repository contains the backend for the Image Uploader project. It provides a Fastify API that accepts multipart image uploads, stores the files in Cloudflare R2, saves upload metadata in PostgreSQL, lists uploaded files with pagination and search, and generates CSV export reports.

The project is intentionally compact, but it still covers practical backend concerns such as schema validation with Zod, database access with Drizzle ORM, API documentation with Swagger, and automated tests with Vitest.

If you are also running the frontend widget, this API is the service responsible for receiving the uploaded files and returning the public file URL used by the UI.

### Built With

[![Node](https://img.shields.io/badge/Node.js-222?logo=node.js&logoColor=5FA04E)](https://nodejs.org/en)
[![TypeScript](https://img.shields.io/badge/TypeScript-222?logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-222?logo=fastify&logoColor=white)](https://fastify.dev)
[![Zod](https://img.shields.io/badge/Zod-222?logo=zod&logoColor=3E67B1)](https://zod.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-222?logo=postgresql&logoColor=4169E1)](https://www.postgresql.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-222?logo=drizzle&logoColor=C5F74F)](https://orm.drizzle.team)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare%20R2-222?logo=cloudflare&logoColor=F38020)](https://www.cloudflare.com/developer-platform/r2/)
[![Swagger](https://img.shields.io/badge/Swagger-222?logo=swagger&logoColor=85EA2D)](https://swagger.io)
[![Vitest](https://img.shields.io/badge/Vitest-222?logo=vitest&logoColor=6E9F18)](https://vitest.dev)

## Features

- Upload image files with `multipart/form-data`
- Accept `.jpg`, `.jpeg`, `.png`, and `.webp` formats
- Reject files larger than 4 MB
- Persist file metadata in PostgreSQL
- Store uploaded files and generated CSV reports in Cloudflare R2
- List uploads with pagination, filtering, and sorting
- Export uploads to a CSV report
- Browse interactive API docs through Swagger UI

## Local Setup Instructions

1. **Install dependencies**: Navigate to the project directory and install the necessary dependencies:

   ```bash
   cd image-uploader-api
   pnpm install
   ```

2. **Environment Variables**: Create `.env` and `.env.test` files to store your environment variables. You can copy the example file and then edit it:

   ```bash
   cp .env.example .env
   cp .env.test.example .env.test
   ```

   Required environment variables:

   ```env
   NODE_ENV="development"
   PORT="3333"
   DB_URL="postgresql://postgres:postgres@localhost:5432/image_uploader"
   CLOUDFLARE_ACCOUNT_ID=""
   CLOUDFLARE_ACCESS_KEY_ID=""
   CLOUDFLARE_SECRET_ACCESS_KEY=""
   CLOUDFLARE_BUCKET=""
   CLOUDFLARE_PUBLIC_URL=""
   ```

  > [!IMPORTANT]
  > - Use `localhost` in `DB_URL` when running the API from your machine.
  > - Use `postgres` in `DB_URL` when running the API from Docker networking.
  > - The API needs valid Cloudflare R2 credentials to upload files and export reports.

3. **Start PostgreSQL with Docker Compose**: Spin up a local PostgreSQL instance using Docker.

   ```bash
   docker compose up -d
   ```

  <div align="center">
    <img src="./docs/3. Docker.png" alt="Docker compose" style="width: 60%; border-radius: 5px;"/>
  </div>

  > [!Note]
  > This project includes a PostgreSQL container configured for the `image_uploader` and `image_uploader_test` databases.

4. **Run database migrations**: Apply all database schema migrations.

   ```bash
   pnpm db:migrate
   ```

5. **Start the development server**: Launch the API in development mode with hot-reloading enabled.

   ```bash
   pnpm dev
   ```

  <div align="center">
    <img src="./docs/4. Terminal.png" alt="Docker compose" style="width: 60%; border-radius: 5px;"/>
  </div>

6. **Open the API docs**: Access the interactive API documentation (Swagger) in your browser to explore available endpoints.

   ```text
   http://localhost:3333/docs

7. **Frontend Interface (Optional)**: If you want to experience the application with a frontend, follow the [Application Local Setup Instructions](https://github.com/heldercostaa/image-uploader#local-setup-instructions) to have it running. This step is optional as the API can be entirely called by endpoints.

## API Reference

<div align="center">
  <img src="./docs/2. Swagger.png" alt="API Documentation" style="width: 95%; border-radius: 5px;"/>
</div>

Once the server is running, Swagger UI is available at:

```text
http://localhost:3333/docs
```

Main routes:

### `POST /uploads`

Uploads a single image file.

Request:

```http
POST /uploads
Content-Type: multipart/form-data
```

Success response:

```json
{
  "url": "https://your-public-file-url.com/images/file.webp"
}
```

### `GET /uploads`

Lists uploaded files.

Supported query params:

- `searchQuery`
- `sortBy=createdAt`
- `sortDirection=asc|desc`
- `page`
- `pageSize`

Success response:

```json
{
  "uploads": [
    {
      "id": "0195f1b8-5d2a-7a57-a95a-7f9e87a9f9c1",
      "name": "example.webp",
      "remoteKey": "images/uuid-example.webp",
      "remoteUrl": "https://your-public-file-url.com/images/uuid-example.webp",
      "createdAt": "2026-04-08T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

### `POST /uploads/export`

Generates a CSV report for uploads and stores it in Cloudflare R2.

Optional query params:

- `searchQuery`

Success response:

```json
{
  "reportUrl": "https://your-public-file-url.com/downloads/uploads.csv"
}
```

## Tests

To run the E2E tests, a testing database is required, preferably a different instance from the development one. If you ran the application with Docker Compose, it will have one generated. If not, you must set it up and specify the credentials in the `.env.example` file.

After setting up a test database, run the tests with:

```bash
pnpm run test
```

<div align="center">
  <img src="./docs/5. Tests.png" alt="Tests" style="width: 70%; border-radius: 5px;"/>
</div>

Run tests in watch mode:

```bash
pnpm test:watch
```

## Extra Commands

Few useful extra commands for database and migrations.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:test
pnpm db:studio
```
