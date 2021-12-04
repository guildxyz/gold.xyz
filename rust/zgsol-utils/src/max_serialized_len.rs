use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

pub trait MaxSerializedLen: BorshDeserialize + BorshSerialize {
    const MAX_SERIALIZED_LEN: usize;
}

macro_rules! impl_max_serialized_length {
    ($this:ty, $len:expr) => {
        impl MaxSerializedLen for $this {
            const MAX_SERIALIZED_LEN: usize = $len;
        }
    };
}

impl_max_serialized_length!(bool, 1);
impl_max_serialized_length!(u8, 1);
impl_max_serialized_length!(u16, 2);
impl_max_serialized_length!(u32, 4);
impl_max_serialized_length!(u64, 8);
impl_max_serialized_length!(u128, 16);
impl_max_serialized_length!(i8, 1);
impl_max_serialized_length!(i16, 2);
impl_max_serialized_length!(i32, 4);
impl_max_serialized_length!(i64, 8);
impl_max_serialized_length!(i128, 16);
impl_max_serialized_length!(Pubkey, 32);
impl_max_serialized_length!([u8; 32], 32);

impl<T> MaxSerializedLen for Option<T>
where
    T: MaxSerializedLen,
{
    const MAX_SERIALIZED_LEN: usize = 1 + T::MAX_SERIALIZED_LEN;
}

#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::UnixTimestamp;

    #[derive(BorshSerialize, BorshDeserialize, MaxSerializedLen, Debug)]
    struct Something {
        a: u64,
        b: i32,
    }

    #[derive(BorshSerialize, BorshDeserialize, MaxSerializedLen, Debug)]
    struct Dummy {
        something: Something,
        #[len(4 + 8 * 2)]
        c: Vec<u16>,
    }

    #[repr(C)]
    #[derive(BorshSerialize, BorshDeserialize, MaxSerializedLen, Debug)]
    struct DummyOption {
        a: u64,
        b: Option<Dummy>,
    }

    #[test]
    fn test_derive() {
        assert_eq!(Dummy::MAX_SERIALIZED_LEN, 32);
    }

    #[test]
    fn serialized_lenghts() {
        let u: UnixTimestamp = 234232;
        assert_eq!(
            u.try_to_vec().unwrap().len(),
            UnixTimestamp::MAX_SERIALIZED_LEN
        );
    }

    #[test]
    fn option_max_serialized_len() {
        let none: Option<u64> = None;
        assert!(none.try_to_vec().unwrap().len() <= Option::<u64>::MAX_SERIALIZED_LEN);
        let none: Option<u64> = Some(15_u64);
        assert_eq!(
            none.try_to_vec().unwrap().len(),
            Option::<u64>::MAX_SERIALIZED_LEN
        );

        let mut dummy_option = DummyOption {
            a: u64::MAX,
            b: None,
        };
        assert!(dummy_option.try_to_vec().unwrap().len() <= DummyOption::MAX_SERIALIZED_LEN);
        dummy_option.b = Some(Dummy {
            something: Something { a: 0, b: 1456 },
            c: vec![542; 8],
        });
        assert_eq!(
            dummy_option.try_to_vec().unwrap().len(),
            DummyOption::MAX_SERIALIZED_LEN
        );
    }

    #[derive(BorshSerialize, BorshDeserialize, MaxSerializedLen, Debug)]
    enum DummyEnum {
        Hello {
            a: u64,
            b: Pubkey,
        },
        Bello,
        Yello(Option<Pubkey>),
        #[len(200)]
        Zello(String),
    }

    #[derive(BorshSerialize, BorshDeserialize, MaxSerializedLen, Debug)]
    enum OtherEnum {
        Dummy(DummyEnum),
        Foo,
        Bar {
            #[len(220)]
            foo: String,
            bar: u8,
        },
        Baz(DummyOption),
    }

    #[test]
    fn enum_max_serialized_len() {
        let en = DummyEnum::Hello {
            a: 89,
            b: Pubkey::new_unique(),
        };
        assert_eq!(DummyEnum::MAX_SERIALIZED_LEN, 201);
        assert_eq!(en.try_to_vec().unwrap().len(), 41);

        let en = OtherEnum::Dummy(en);
        assert_eq!(OtherEnum::MAX_SERIALIZED_LEN, 222);
        assert_eq!(en.try_to_vec().unwrap().len(), 42);

        let en = OtherEnum::Baz(DummyOption {
            a: 1234,
            b: Some(Dummy {
                something: Something { a: 100, b: 200 },
                c: vec![2256; 8],
            }),
        });
        assert_eq!(
            en.try_to_vec().unwrap().len(),
            1 + DummyOption::MAX_SERIALIZED_LEN
        );
    }
}
