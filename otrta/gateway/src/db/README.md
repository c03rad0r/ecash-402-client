# Database Helpers

This module provides a structured approach to working with the Postgres database in the Wallet Gateway application.

## Structure

The database module is structured as follows:

- `helpers/`: Contains generic database utilities and CRUD operations

  - `crud.rs`: Generic CRUD trait and implementation
  - `query.rs`: Helper functions for common database operations

- Entity modules (organizations, users, etc.): Each entity has its own module with specialized operations
  - `operations.rs`: Implements CRUD operations for the entity

## Usage

### Applying Migrations

To apply migrations, run:

```bash
# Set the database URL environment variable
export DATABASE_URL=postgres://username:password@localhost/wallet_gateway

# Run the migration binary
cargo run --bin migrate
```

Or use the SQLx CLI:

```bash
# Install SQLx CLI (if not already installed)
cargo install sqlx-cli

# Run migrations
sqlx migrate run
```

### Using CRUD Operations

Each entity has high-level functions for CRUD operations. For example:

```rust
use crate::db::{Pool, users};
use crate::models::{CreateUser, UserRole};

async fn create_user_example(pool: &Pool) -> Result<(), Box<dyn std::error::Error>> {
    let new_user = CreateUser {
        email: "user@example.com".to_string(),
        name: "Example User".to_string(),
        avatar_url: None,
        organization_id: "org_default".to_string(),
        role: UserRole::Developer,
        is_active: true,
    };

    let user = users::create_user(pool, &new_user).await?;
    println!("Created user: {:?}", user);

    Ok(())
}
```

### Using Transactions

For operations that require a transaction:

```rust
use crate::db::helpers::with_transaction;

async fn create_organization_with_user(pool: &Pool) -> Result<(), DbError> {
    with_transaction(pool, |tx| {
        Box::pin(async move {
            // Create organization
            let org_data = CreateOrganization {
                name: "New Organization".to_string(),
                description: Some("A new organization".to_string()),
                slug: Some("new-org".to_string()),
                logo_url: None,
                domain: None,
                plan: None,
                is_active: true,
            };

            let org = sqlx::query_as!(/* ... */)
                .fetch_one(&mut *tx)
                .await?;

            // Create user in the organization
            let user_data = CreateUser {
                email: "admin@new-org.com".to_string(),
                name: "Admin User".to_string(),
                avatar_url: None,
                organization_id: org.id.clone(),
                role: UserRole::Admin,
                is_active: true,
            };

            let user = sqlx::query_as!(/* ... */)
                .fetch_one(&mut *tx)
                .await?;

            Ok((org, user))
        })
    }).await
}
```

## Error Handling

All database operations return a `DbResult<T>` which is an alias for `Result<T, DbError>`. This ensures consistent error handling throughout the application.

## Adding New Entity Helpers

To add a new entity helper:

1. Create a new directory under `src/db/` for your entity
2. Create a `mod.rs` file that exports your operations
3. Create an `operations.rs` file with your CRUD implementation
4. Add your module to `src/db/mod.rs`

Follow the pattern used in the existing entity modules.
