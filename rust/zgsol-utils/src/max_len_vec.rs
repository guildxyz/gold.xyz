use super::MaxSerializedLen;

use borsh::{BorshDeserialize, BorshSerialize};

use std::collections::VecDeque;

use std::convert::TryFrom;

#[repr(C)]
#[derive(BorshDeserialize, BorshSerialize, Clone, Debug)]
pub struct MaxLenVec<T, const N: usize>
where
    T: MaxSerializedLen + Clone,
{
    contents: VecDeque<T>,
}

impl<T, const N: usize> MaxSerializedLen for MaxLenVec<T, N>
where
    T: MaxSerializedLen + Clone,
{
    const MAX_SERIALIZED_LEN: usize = 4 + N * T::MAX_SERIALIZED_LEN;
}

impl<T, const N: usize> MaxLenVec<T, N>
where
    T: MaxSerializedLen + Clone,
{
    pub fn new() -> Self {
        MaxLenVec {
            contents: VecDeque::new(),
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

    pub fn push(&mut self, elem: T) {
        self.contents.push_back(elem);
    }

    pub fn pop(&mut self) -> Option<T> {
        self.contents.pop_back()
    }

    pub fn cyclic_push(&mut self, elem: T) {
        if self.is_full() {
            self.contents.pop_front();
        }
        self.contents.push_back(elem);
    }

    pub fn get(&self, index: usize) -> Option<&T> {
        self.contents.get(index)
    }

    pub fn get_last_element(&self) -> Option<T> {
        if self.is_empty() {
            return None;
        }
        Some(self.contents.get(self.len() - 1).unwrap().clone())
    }
}

impl<T, const N: usize> TryFrom<VecDeque<T>> for MaxLenVec<T, N>
where
    T: MaxSerializedLen + Clone,
{
    type Error = String;

    fn try_from(vecdeq: VecDeque<T>) -> Result<Self, Self::Error> {
        if vecdeq.len() > N {
            return Err(format!(
                "Unable to create MaxLenVec. VecDeque has too many elements ({})",
                vecdeq.len()
            ));
        }
        Ok(Self { contents: vecdeq })
    }
}

impl<T, const N: usize> TryFrom<Vec<T>> for MaxLenVec<T, N>
where
    T: MaxSerializedLen + Clone,
{
    type Error = String;

    fn try_from(vec: Vec<T>) -> Result<Self, Self::Error> {
        if vec.len() > N {
            return Err(format!(
                "Unable to create MaxLenVec. Vec has too many elements ({})",
                vec.len()
            ));
        }
        Ok(Self {
            contents: vec.into(),
        })
    }
}

impl<T, const N: usize> Default for MaxLenVec<T, N>
where
    T: MaxSerializedLen + Clone,
{
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod test_max_len_vec {
    use super::*;

    type TestVec = MaxLenVec<u8, 5>;

    #[test]
    fn valid_conversions() {
        let vec: Vec<u8> = vec![1, 2, 3, 4, 5];
        let deque: VecDeque<u8> = vec.clone().into();

        let max_len_vec = TestVec::try_from(vec).unwrap();
        assert_eq!(deque, max_len_vec.contents);

        let max_len_vec = TestVec::try_from(deque.clone()).unwrap();
        assert_eq!(deque, max_len_vec.contents);
    }

    #[test]
    fn invalid_conversions() {
        let long_vec: Vec<u8> = vec![1, 2, 3, 4, 5, 6];
        assert!(TestVec::try_from(long_vec.clone()).is_err());

        let long_deque: VecDeque<u8> = long_vec.into();
        assert!(TestVec::try_from(long_deque).is_err());
    }

    #[test]
    fn max_len_vec_serialized_len() {
        let mut test_vec = TestVec::new();
        assert!(test_vec.try_to_vec().unwrap().len() <= TestVec::MAX_SERIALIZED_LEN);

        for i in 0..4 {
            test_vec.push(i);
        }
        assert!(test_vec.try_to_vec().unwrap().len() <= TestVec::MAX_SERIALIZED_LEN);

        test_vec.push(4);
        assert_eq!(
            test_vec.try_to_vec().unwrap().len(),
            TestVec::MAX_SERIALIZED_LEN
        );
    }
}
