use crate::db::helpers::{offset_option_to_chrono, offset_to_chrono};
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use wallet::models::ServerConfig;

pub struct ServerConfigRecord {
    pub id: String,
    pub endpoint: String,
    pub api_key: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

pub async fn get_all_configs(pool: &PgPool) -> Result<Vec<ServerConfigRecord>, sqlx::Error> {
    let configs = sqlx::query!(
        r#"
        SELECT id, endpoint, api_key, created_at, updated_at
        FROM server_config
        "#
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| ServerConfigRecord {
        id: record.id,
        endpoint: record.endpoint,
        api_key: record.api_key,
        created_at: offset_to_chrono(record.created_at),
        updated_at: offset_option_to_chrono(record.updated_at),
    })
    .collect();

    Ok(configs)
}

pub async fn get_config_by_id(
    pool: &PgPool,
    id: &str,
) -> Result<Option<ServerConfigRecord>, sqlx::Error> {
    let record = sqlx::query!(
        r#"
        SELECT id, endpoint, api_key, created_at, updated_at
        FROM server_config
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool)
    .await?;

    match record {
        Some(r) => Ok(Some(ServerConfigRecord {
            id: r.id,
            endpoint: r.endpoint,
            api_key: r.api_key,
            created_at: offset_to_chrono(r.created_at),
            updated_at: offset_option_to_chrono(r.updated_at),
        })),
        None => Ok(None),
    }
}

pub async fn get_default_config(pool: &PgPool) -> Result<Option<ServerConfigRecord>, sqlx::Error> {
    let record = sqlx::query!(
        r#"
        SELECT id, endpoint, api_key, created_at, updated_at
        FROM server_config
        ORDER BY created_at ASC
        LIMIT 1
        "#
    )
    .fetch_optional(pool)
    .await?;

    match record {
        Some(r) => Ok(Some(ServerConfigRecord {
            id: r.id,
            endpoint: r.endpoint,
            api_key: r.api_key,
            created_at: offset_to_chrono(r.created_at),
            updated_at: offset_option_to_chrono(r.updated_at),
        })),
        None => Ok(None),
    }
}

pub async fn create_config(
    pool: &PgPool,
    config: &ServerConfig,
) -> Result<ServerConfigRecord, sqlx::Error> {
    let id = format!(
        "config_{}",
        uuid::Uuid::new_v4().to_string().replace("-", "")
    );

    let record = sqlx::query!(
        r#"
        INSERT INTO server_config (id, endpoint, api_key, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, endpoint, api_key, created_at, updated_at
        "#,
        id,
        config.endpoint,
        config.api_key
    )
    .fetch_one(pool)
    .await?;

    Ok(ServerConfigRecord {
        id: record.id,
        endpoint: record.endpoint,
        api_key: record.api_key,
        created_at: offset_to_chrono(record.created_at),
        updated_at: offset_option_to_chrono(record.updated_at),
    })
}

pub async fn update_config(
    pool: &PgPool,
    id: String,
    config: &ServerConfig,
) -> Result<ServerConfigRecord, sqlx::Error> {
    let record = sqlx::query!(
        r#"
        UPDATE server_config
        SET endpoint = $1, api_key = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, endpoint, api_key, created_at, updated_at
        "#,
        config.endpoint,
        config.api_key,
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(ServerConfigRecord {
        id: record.id,
        endpoint: record.endpoint,
        api_key: record.api_key,
        created_at: offset_to_chrono(record.created_at),
        updated_at: offset_option_to_chrono(record.updated_at),
    })
}

pub async fn delete_config(pool: &PgPool, id: &str) -> Result<bool, sqlx::Error> {
    let result = sqlx::query!(
        r#"
        DELETE FROM server_config
        WHERE id = $1
        "#,
        id
    )
    .execute(pool)
    .await?;

    Ok(result.rows_affected() > 0)
}

pub async fn config_exists(pool: &PgPool, id: &str) -> Result<bool, sqlx::Error> {
    let result = sqlx::query!(
        r#"
        SELECT EXISTS(SELECT 1 FROM server_config WHERE id = $1) as exists
        "#,
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(result.exists.unwrap_or(false))
}

pub async fn count_configs(pool: &PgPool) -> Result<i64, sqlx::Error> {
    let result = sqlx::query!(
        r#"
        SELECT COUNT(*) as count FROM server_config
        "#
    )
    .fetch_one(pool)
    .await?;

    Ok(result.count.unwrap_or(0))
}

impl ServerConfigRecord {
    pub fn to_model(&self) -> ServerConfig {
        ServerConfig {
            endpoint: self.endpoint.clone(),
            api_key: self.api_key.clone(),
        }
    }
}
