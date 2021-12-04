use solana_program::pubkey::Pubkey;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SignerPdaError {
    #[error("Create account with PDA {0} was requested while PDA {1} was expected")]
    SignerSeedMismatch(Pubkey, Pubkey),
}

pub struct SignerPda<'a, 'b> {
    pub pda: Pubkey,
    pub bump: [u8; 1],
    pub seeds: &'b [&'a [u8]],
}

impl<'a, 'b> SignerPda<'a, 'b> {
    pub fn new_checked(
        seeds: &'b [&'a [u8]],
        expected: &Pubkey,
        program_id: &Pubkey,
    ) -> Result<Self, SignerPdaError>
where {
        let (pda, bump) = Pubkey::find_program_address(seeds, program_id);

        if pda != *expected {
            Err(SignerPdaError::SignerSeedMismatch(pda, *expected))
        } else {
            Ok(Self {
                pda,
                bump: [bump],
                seeds,
            })
        }
    }

    pub fn signer_seeds(&'a self) -> Vec<&'a [u8]> {
        let mut signer_seeds = self.seeds.to_vec();
        signer_seeds.push(&self.bump);
        signer_seeds
    }
}
