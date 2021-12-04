use super::MaxSerializedLen;

use borsh::{BorshDeserialize, BorshSerialize};

use std::collections::BTreeMap;
use std::convert::TryFrom;
use std::hash::Hash;

#[repr(C)]
#[derive(BorshDeserialize, BorshSerialize, Clone, Debug)]
pub struct MaxLenBTreeMap<K, V, const N: usize>
where
    K: MaxSerializedLen + Clone + Ord + Hash,
    V: MaxSerializedLen + Clone,
{
    contents: BTreeMap<K, V>,
}

impl<K, V, const N: usize> MaxSerializedLen for MaxLenBTreeMap<K, V, N>
where
    K: MaxSerializedLen + Clone + Ord + Hash,
    V: MaxSerializedLen + Clone,
{
    const MAX_SERIALIZED_LEN: usize = 4 + N * (K::MAX_SERIALIZED_LEN + V::MAX_SERIALIZED_LEN);
}

impl<K, V, const N: usize> MaxLenBTreeMap<K, V, N>
where
    K: MaxSerializedLen + Clone + Ord + Hash,
    V: MaxSerializedLen + Clone,
{
    pub fn new() -> Self {
        Self {
            contents: BTreeMap::new(),
        }
    }

    pub fn len(&self) -> usize {
        self.contents.len()
    }

    pub fn is_empty(&self) -> bool {
        self.contents.len() == 0
    }

    pub fn is_full(&self) -> bool {
        self.contents.len() == N
    }

    pub fn insert(&mut self, key: K, value: V) -> Option<V> {
        assert!(!self.is_full(), "MaxLenBtreeMap is full");
        self.contents.insert(key, value)
    }

    pub fn remove(&mut self, key: &K) {
        self.contents.remove(key);
    }

    pub fn get(&self, key: &K) -> Option<&V> {
        self.contents.get(key)
    }

    pub fn contains_key(&self, key: &K) -> bool {
        self.contents.contains_key(key)
    }

    pub fn clear(&mut self) {
        self.contents.clear();
    }

    pub fn contents(&self) -> &BTreeMap<K, V> {
        &self.contents
    }
}

impl<K, V, const N: usize> TryFrom<BTreeMap<K, V>> for MaxLenBTreeMap<K, V, N>
where
    K: MaxSerializedLen + Clone + Ord + Hash,
    V: MaxSerializedLen + Clone,
{
    type Error = String;

    fn try_from(btree: BTreeMap<K, V>) -> Result<Self, Self::Error> {
        if btree.len() > N {
            return Err(format!(
                "Unable to create MaxLenBTreeMap. BTreeMap has too many elements ({})",
                btree.len()
            ));
        }
        Ok(Self { contents: btree })
    }
}

impl<K, V, const N: usize> Default for MaxLenBTreeMap<K, V, N>
where
    K: MaxSerializedLen + Clone + Ord + Hash,
    V: MaxSerializedLen + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod test_max_len_btreemap {
    use super::*;

    type TestBTree = MaxLenBTreeMap<u8, u32, 5>;
    type BaseBTree = BTreeMap<u8, u32>;

    #[test]
    fn valid_conversions() {
        let mut btree = BaseBTree::new();

        for i in 0..5 {
            btree.insert(i as u8, i);
        }

        let max_len_btree = TestBTree::try_from(btree.clone()).unwrap();
        assert_eq!(btree, max_len_btree.contents);
    }

    #[test]
    fn invalid_conversions() {
        let mut btree = BaseBTree::new();

        for i in 0..6 {
            btree.insert(i as u8, i);
        }

        assert!(TestBTree::try_from(btree).is_err());
    }

    #[test]
    fn max_len_btreemap_serialized_len() {
        let mut test_btree: TestBTree = TestBTree::new();
        assert!(test_btree.try_to_vec().unwrap().len() <= TestBTree::MAX_SERIALIZED_LEN);

        for i in 0..4 {
            test_btree.insert(i as u8, i);
        }

        assert!(test_btree.try_to_vec().unwrap().len() <= TestBTree::MAX_SERIALIZED_LEN);
        test_btree.insert(83_u8, 81237);
        assert_eq!(
            test_btree.try_to_vec().unwrap().len(),
            TestBTree::MAX_SERIALIZED_LEN
        );
    }
}
