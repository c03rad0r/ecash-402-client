use std::env;
use std::sync::Arc;
use std::time::Duration;

use cdk::Amount;
use cdk::amount::SplitTarget;
use cdk::nuts::nut00::ProofsMethods;
use cdk::nuts::{CurrencyUnit, MintQuoteState};
use cdk::wallet::Wallet;
use cdk_redb::wallet::WalletRedbDatabase;
use tokio::time::sleep;
use wallet::wallet::prepare_seed;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // let seed = random::<[u8; 32]>();
    let words = env::var("OTRTA_SEED").unwrap();
    let seed = prepare_seed(&words);

    // Mint URL and currency unit
    let mint_url = "https://fake.thesimplekid.dev";
    let unit = CurrencyUnit::Sat;
    let amount = Amount::from(10);
    let file = tempfile::NamedTempFile::new().unwrap();
    let redb_store = Arc::new(WalletRedbDatabase::new(file.path()).unwrap());

    let wallet = Wallet::new(mint_url, unit, redb_store, &seed, None)?;

    // println!(
    //     "{:?}",
    //     wallet.mint_quote(Amount::from(10), None).await.unwrap()
    // );

    let quote = wallet.mint_quote(amount, None).await?;

    println!("Pay request: {}", quote.request);

    let timeout = Duration::from_secs(120); // Set a timeout duration
    let start = std::time::Instant::now();

    loop {
        let status = wallet.mint_quote_state(&quote.id).await?;

        if status.state == MintQuoteState::Paid {
            break;
        }

        if start.elapsed() >= timeout {
            eprintln!("Timeout while waiting for mint quote to be paid");
            return Err("Timeout while waiting for mint quote to be paid".into());
        }

        println!("Quote state: {}", status.state);

        sleep(Duration::from_secs(5)).await;
    }

    // Mint the received amount
    let proofs = wallet.mint(&quote.id, SplitTarget::default(), None).await?;
    let receive_amount = proofs.total_amount()?;
    println!("Minted {}", receive_amount);

    println!("{:?}", wallet.get_mint_info().await.unwrap());
    println!("{:?}", wallet.total_balance().await.unwrap());
    println!("{:?}", wallet.total_pending_balance().await.unwrap());
    println!("{:?}", wallet.total_reserved_balance().await.unwrap());

    // Send the token
    // let prepared_send = wallet.prepare_send(amount, SendOptions::default()).await?;
    // let token = wallet.send(prepared_send, None).await?;

    // println!("{}", token);

    Ok(())
}
