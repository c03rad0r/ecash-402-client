# Wallet Gateway API Server

This is the backend server for the Wallet Gateway application, providing REST API endpoints that are consumed by the frontend UI.

## Features

- RESTful API built with Axum
- In-memory data storage with shared state
- Authentication middleware that allows all requests (can be customized as needed)
- Comprehensive endpoints for managing users, organizations, API keys, models, providers, and credits

## API Endpoints

- **Auth**
  - POST `/api/login` - Authenticate a user
  - POST `/api/register` - Register a new user

- **Users**
  - GET `/api/users` - List all users
  - POST `/api/users` - Create a new user
  - GET `/api/users/:id` - Get a user by ID
  - PUT `/api/users/:id` - Update a user
  - DELETE `/api/users/:id` - Delete a user

- **Organizations**
  - GET `/api/organizations` - List all organizations
  - POST `/api/organizations` - Create a new organization
  - GET `/api/organizations/:id` - Get an organization by ID
  - PUT `/api/organizations/:id` - Update an organization
  - DELETE `/api/organizations/:id` - Delete an organization

- **API Keys**
  - GET `/api/api-keys` - List all API keys
  - POST `/api/api-keys` - Create a new API key
  - GET `/api/api-keys/:id` - Get an API key by ID
  - PUT `/api/api-keys/:id` - Update an API key
  - DELETE `/api/api-keys/:id` - Delete an API key

- **Models**
  - GET `/api/models` - List all models
  - POST `/api/models` - Create a new model
  - GET `/api/models/:id` - Get a model by ID
  - PUT `/api/models/:id` - Update a model
  - DELETE `/api/models/:id` - Delete a model

- **Providers**
  - GET `/api/providers` - List all providers
  - POST `/api/providers` - Create a new provider
  - GET `/api/providers/:id` - Get a provider by ID
  - PUT `/api/providers/:id` - Update a provider
  - DELETE `/api/providers/:id` - Delete a provider

- **Credits**
  - GET `/api/credits` - List all credits
  - POST `/api/credits` - Create a new credit
  - GET `/api/credits/:id` - Get a credit by ID
  - PUT `/api/credits/:id` - Update a credit
  - DELETE `/api/credits/:id` - Delete a credit

## Running the Server

```bash
cargo run --bin server
```

The server will start on `0.0.0.0:3001` by default.

## Authentication

The current implementation has a pass-through authentication middleware that accepts all requests. In a production environment, you would implement proper authentication and authorization checks in the `auth_middleware` function. 