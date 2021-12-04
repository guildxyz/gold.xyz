use super::*;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::clock::UnixTimestamp;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Timelock<T: MaxSerializedLen + Clone, const N: usize>(Vec<LockedItem<T>>);

impl<T: MaxSerializedLen + Clone, const N: usize> MaxSerializedLen for Timelock<T, N> {
    const MAX_SERIALIZED_LEN: usize = 4 + N * (T::MAX_SERIALIZED_LEN + 8); // UnixTimestamp is an extra 8 bytes
}

impl<T, const N: usize> AccountState for Timelock<T, N> where T: MaxSerializedLen + Clone {}

impl<T, const N: usize> Timelock<T, N>
where
    T: MaxSerializedLen + Clone,
{
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn lock(&mut self, item: T, expiration_date: UnixTimestamp) -> Result<(), TimelockError> {
        if self.0.len() < N {
            self.0.push(LockedItem {
                item,
                expires: expiration_date,
            });
            Ok(())
        } else {
            Err(TimelockError::TimelockStorageFull)
        }
    }

    pub fn locked_items(&self) -> &Vec<LockedItem<T>> {
        &self.0
    }

    pub fn locked_items_mut(&mut self) -> &mut Vec<LockedItem<T>> {
        &mut self.0
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn max_len(&self) -> usize {
        N
    }
}

impl<T, const N: usize> Default for Timelock<T, N>
where
    T: MaxSerializedLen + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug)]
pub enum TimelockError {
    TimelockStorageFull,
}

#[cfg(test)]
mod test {
    use super::*;

    #[derive(BorshSerialize, BorshDeserialize, Clone, Copy, Debug)]
    struct Dummy {
        a: u64,
        b: i32,
        c: [u8; 5],
    }

    impl MaxSerializedLen for Dummy {
        const MAX_SERIALIZED_LEN: usize = 17;
    }

    const L: usize = 10;

    #[test]
    #[rustfmt::skip]
    fn serialized_len() {
        let mut timelock = Timelock::<Dummy, L>::new();
        for i in 0..L {
            timelock.lock(Dummy { a: 4, b: -3423, c: [0_u8; 5] }, 32445 + i as UnixTimestamp).unwrap();
        }
        assert_eq!(Timelock::<Dummy, L>::MAX_SERIALIZED_LEN, timelock.try_to_vec().unwrap().len());

        // limit reached
        assert!(timelock.lock(Dummy { a: 4, b: -3423, c: [0_u8; 5] }, 32445).is_err());
        assert_eq!(timelock.len(), L);
    }
}
