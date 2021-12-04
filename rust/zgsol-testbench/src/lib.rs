use borsh::BorshDeserialize;
use solana_program::borsh::try_from_slice_unchecked;
use solana_program::bpf_loader_upgradeable::{self, UpgradeableLoaderState};
use solana_program::clock::UnixTimestamp;
use solana_program::program_pack::Pack;
use solana_program::pubkey::Pubkey;
use solana_program::rent::Rent;
pub use solana_program_test::processor;
pub use solana_program_test::tokio;
use solana_program_test::*;

use solana_sdk::instruction::Instruction;
use solana_sdk::process_instruction::ProcessInstructionWithContext;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use solana_sdk::system_instruction;
use solana_sdk::transaction::{Transaction, TransactionError};

use spl_token::instruction as token_instruction;
use spl_token::state::{Account as TokenAccount, Mint};

pub struct TestbenchProgram<'a> {
    pub name: &'a str,
    pub id: Pubkey,
    pub process_instruction: Option<ProcessInstructionWithContext>,
}

pub struct Testbench {
    pub context: ProgramTestContext,
    pub rent: Rent,
}

impl Testbench {
    pub async fn new(programs: &[TestbenchProgram<'_>]) -> Self {
        let mut program_test = ProgramTest::default();

        for program in programs {
            program_test.add_program(program.name, program.id, program.process_instruction)
        }

        let mut context = program_test.start_with_context().await;
        let rent = context.banks_client.get_rent().await.unwrap();

        Self { context, rent }
    }

    pub fn client(&mut self) -> &mut BanksClient {
        &mut self.context.banks_client
    }

    pub fn payer(&self) -> &Keypair {
        &self.context.payer
    }

    pub fn clone_payer(&self) -> Keypair {
        Keypair::from_bytes(self.context.payer.to_bytes().as_ref()).unwrap()
    }

    // TODO make this nicer?
    pub async fn block_time(&mut self) -> UnixTimestamp {
        let clock_sysvar = self
            .client()
            .get_account(solana_program::sysvar::clock::id())
            .await
            .unwrap() // result
            .unwrap(); // option
        solana_sdk::account::from_account::<solana_program::clock::Clock, _>(&clock_sysvar)
            .unwrap()
            .unix_timestamp
        //self.client().get_clock().await.unwrap().unix_timestamp
        //todo!("Solana 1.9.0 removed get_clock for some reason");
    }

    pub fn warp_to_slot(&mut self, slot: u64) {
        self.context.warp_to_slot(slot).unwrap()
    }

    pub async fn process_transaction(
        &mut self,
        instructions: &[Instruction],
        payer: &Keypair,
        signers: Option<&[&Keypair]>,
    ) -> Result<(), TransactionError> {
        let latest_blockhash = self
            .context
            .banks_client
            .get_latest_blockhash()
            .await
            .unwrap();

        let mut transaction = Transaction::new_with_payer(instructions, Some(&payer.pubkey()));
        let mut all_signers = vec![payer];
        if let Some(signers) = signers {
            all_signers.extend_from_slice(signers);
        }

        transaction.sign(&all_signers, latest_blockhash);

        // TransportError has an unwrap method that turns it into a
        // TransactionError
        self.context
            .banks_client
            .process_transaction(transaction)
            .await
            .map_err(|e| e.unwrap())
    }

    pub async fn create_mint(&mut self, decimals: u8, mint_authority: &Pubkey) -> Pubkey {
        let mint_keypair = Keypair::new();
        let mint_rent = self.rent.minimum_balance(Mint::LEN);
        let instructions = [
            system_instruction::create_account(
                &self.context.payer.pubkey(),
                &mint_keypair.pubkey(),
                mint_rent,
                Mint::LEN as u64,
                &spl_token::id(),
            ),
            token_instruction::initialize_mint(
                &spl_token::id(),
                &mint_keypair.pubkey(),
                mint_authority,
                None,
                decimals,
            )
            .unwrap(),
        ];

        let payer = self.clone_payer();
        self.process_transaction(&instructions, &payer, Some(&[&mint_keypair]))
            .await
            .unwrap();

        mint_keypair.pubkey()
    }

    pub async fn create_token_holding_account(&mut self, owner: &Keypair, mint: &Pubkey) -> Pubkey {
        let account_keypair = Keypair::new();
        let mint_rent = self.rent.minimum_balance(TokenAccount::LEN);
        let instructions = [
            system_instruction::create_account(
                &owner.pubkey(),
                &account_keypair.pubkey(),
                mint_rent,
                TokenAccount::LEN as u64,
                &spl_token::id(),
            ),
            token_instruction::initialize_account(
                &spl_token::id(),
                &account_keypair.pubkey(),
                mint,
                &owner.pubkey(),
            )
            .unwrap(),
        ];

        let payer = self.clone_payer();
        self.process_transaction(&instructions, &payer, Some(&[owner, &account_keypair]))
            .await
            .unwrap();

        account_keypair.pubkey()
    }

    pub async fn mint_to_account(&mut self, mint: &Pubkey, account: &Pubkey, amount: u64) {
        let instruction = token_instruction::mint_to(
            &spl_token::id(),
            mint,
            account,
            &self.payer().pubkey(), // mint authority
            &[&self.payer().pubkey()],
            amount,
        )
        .unwrap();

        let signer = self.clone_payer();
        self.process_transaction(&[instruction], &signer, Some(&[&signer]))
            .await
            .unwrap();
    }

    pub async fn token_balance(&mut self, token_account: &Pubkey) -> u64 {
        let data: TokenAccount = self
            .client()
            .get_packed_account_data(*token_account)
            .await
            .unwrap();

        data.amount
    }

    pub async fn total_supply(&mut self, mint_account: &Pubkey) -> u64 {
        let data: Mint = self
            .client()
            .get_packed_account_data(*mint_account)
            .await
            .unwrap();

        data.supply
    }

    pub async fn get_account_lamports(&mut self, account_pubkey: &Pubkey) -> u64 {
        self.client()
            .get_account(*account_pubkey)
            .await
            .unwrap()
            .unwrap()
            .lamports
    }

    pub async fn get_account_data(&mut self, account_pubkey: &Pubkey) -> Vec<u8> {
        self.client()
            .get_account(*account_pubkey)
            .await
            .unwrap()
            .unwrap()
            .data
    }

    pub async fn get_and_deserialize_account_data<T: BorshDeserialize>(
        &mut self,
        account_pubkey: &Pubkey,
    ) -> T {
        let account_data = self.get_account_data(account_pubkey).await;
        try_from_slice_unchecked(account_data.as_slice()).unwrap()
    }

    pub async fn get_token_account(&mut self, account_pubkey: &Pubkey) -> TokenAccount {
        self.client()
            .get_packed_account_data(*account_pubkey)
            .await
            .unwrap()
    }

    pub async fn get_mint_account(&mut self, account_pubkey: &Pubkey) -> Mint {
        self.client()
            .get_packed_account_data(*account_pubkey)
            .await
            .unwrap()
    }

    pub async fn load_program(&mut self, program_name: &str) -> Pubkey {
        // load program data and its keypair
        let program_path_buf = find_file(program_name).unwrap();
        let program_data = read_file(program_path_buf);

        // keypairs
        let program_keypair = Keypair::new();
        let program_buffer_keypair = Keypair::new();
        let program_upgrade_authority_keypair = Keypair::new(); //read_keypair_file(program_upgrade_buf).unwrap();

        // deploy program
        let program_buffer_rent = self
            .rent
            .minimum_balance(UpgradeableLoaderState::programdata_len(program_data.len()).unwrap());

        let mut instructions = bpf_loader_upgradeable::create_buffer(
            &self.payer().pubkey(),
            &program_buffer_keypair.pubkey(),
            &program_upgrade_authority_keypair.pubkey(),
            program_buffer_rent,
            program_data.len(),
        )
        .unwrap();

        let chunk_size = 800;

        for (chunk, i) in program_data.chunks(chunk_size).zip(0..) {
            instructions.push(bpf_loader_upgradeable::write(
                &program_buffer_keypair.pubkey(),
                &program_upgrade_authority_keypair.pubkey(),
                (i * chunk_size) as u32,
                chunk.to_vec(),
            ));
        }

        let program_account_rent = self
            .rent
            .minimum_balance(UpgradeableLoaderState::program_len().unwrap());

        let deploy_instructions = bpf_loader_upgradeable::deploy_with_max_program_len(
            &self.payer().pubkey(),
            &program_keypair.pubkey(),
            &program_buffer_keypair.pubkey(),
            &program_upgrade_authority_keypair.pubkey(),
            program_account_rent,
            program_data.len(),
        )
        .unwrap();

        instructions.extend_from_slice(&deploy_instructions);

        let payer = self.clone_payer();
        self.process_transaction(
            &instructions[..],
            &payer,
            Some(&[
                &program_upgrade_authority_keypair,
                &program_keypair,
                &program_buffer_keypair,
            ]),
        )
        .await
        .unwrap();

        program_keypair.pubkey()
    }
}
