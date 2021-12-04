use super::MaxSerializedLen;
use solana_program::account_info::AccountInfo;
use solana_program::borsh::try_from_slice_unchecked;
use solana_program::program_error::ProgramError;

pub trait AccountState: MaxSerializedLen {
    fn read(account: &AccountInfo) -> Result<Self, ProgramError>
    where
        Self: Sized,
    {
        let unpacked = try_from_slice_unchecked(&account.data.borrow())?;
        Ok(unpacked)
    }
    fn write(&self, account: &AccountInfo) -> Result<(), ProgramError> {
        self.serialize(&mut &mut account.data.borrow_mut()[..])?;
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use borsh::{BorshDeserialize, BorshSerialize};
    use solana_program::pubkey::Pubkey;
    use std::cell::RefCell;
    use std::rc::Rc;

    const MAX_ENUM_LEN: usize = 9; // 1 + max wrapped value length

    #[derive(BorshSerialize, BorshDeserialize, MaxSerializedLen, AccountState)]
    struct Dummy {
        /// This is a test field called `e`
        #[len(MAX_ENUM_LEN)]
        e: SomeEnum,
        /// This is a test field called `a`
        a: u8,
        /// This is a test field called `b`
        b: u16,
    }

    #[repr(C)]
    #[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug)]
    enum SomeEnum {
        A,
        B(u64),
        C(i8),
    }

    #[test]
    fn read_write_account() {
        let mut lamports = 45;
        let mut data = [0_u8; 3 + MAX_ENUM_LEN];

        let account_info = AccountInfo {
            key: &Pubkey::new_unique(),
            is_signer: true,
            is_writable: true,
            lamports: Rc::new(RefCell::new(&mut lamports)),
            data: Rc::new(RefCell::new(&mut data)),
            owner: &Pubkey::new_unique(),
            executable: false,
            rent_epoch: 4432,
        };

        let dummy = Dummy {
            a: 0x03,
            b: 0xa9f4,
            e: SomeEnum::B(15436),
        };

        dummy.write(&account_info).unwrap();
        let read_dummy = Dummy::read(&account_info).unwrap();
        let some_enum = try_from_slice_unchecked::<SomeEnum>(&account_info.data.borrow()).unwrap();

        assert_eq!(dummy.a, read_dummy.a);
        assert_eq!(dummy.b, read_dummy.b);
        assert_eq!(dummy.e, SomeEnum::B(15436));
        assert_eq!(dummy.e, some_enum);
    }
}
