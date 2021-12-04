use super::MaxSerializedLen;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::clock::UnixTimestamp;
use std::cmp::Ordering;

#[derive(BorshDeserialize, BorshSerialize, Debug, Clone)]
pub struct LockedItem<T: MaxSerializedLen> {
    pub item: T,
    pub expires: UnixTimestamp,
}

impl<T: MaxSerializedLen> MaxSerializedLen for LockedItem<T> {
    const MAX_SERIALIZED_LEN: usize = T::MAX_SERIALIZED_LEN + UnixTimestamp::MAX_SERIALIZED_LEN;
}

impl<T: MaxSerializedLen> PartialOrd for LockedItem<T> {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.expires.cmp(&other.expires))
    }
}

impl<T: MaxSerializedLen> Ord for LockedItem<T> {
    fn cmp(&self, other: &Self) -> Ordering {
        self.expires.cmp(&other.expires)
    }
}

impl<T: MaxSerializedLen> PartialEq for LockedItem<T> {
    fn eq(&self, other: &Self) -> bool {
        self.expires == other.expires
    }
}

impl<T: MaxSerializedLen> Eq for LockedItem<T> {}

impl<T: MaxSerializedLen> LockedItem<T> {
    pub fn expired(&self, current_time: UnixTimestamp) -> bool {
        self.expires < current_time
    }
}
