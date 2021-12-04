use super::TEST_DATA_DIRECTORY;
use crate::*;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::borsh::try_from_slice_unchecked;
use solana_program::pubkey::Pubkey;

use std::collections::BTreeMap;
use std::fs;
use std::io::Write;

#[derive(BorshSchema, BorshSerialize, BorshDeserialize)]
pub struct BTreeWrapper {
    map0: BTreeMap<[u8; 32], Pubkey>,
    map1: BTreeMap<String, Option<u32>>,
    map2: BTreeMap<u16, String>,
}

#[test]
fn generate_layout_from_this_file() {
    let layouts = generate_layout_from_file("src/test/borsh_btree.rs").unwrap();
    assert_eq!(layouts.len(), 1);
    assert_eq!(layouts[0].name, "BTreeWrapper");

    let mut btree0 = BTreeMap::<[u8; 32], Pubkey>::new();
    let mut id = [0; 32];
    let mut pubkey = [0; 32];
    id[0] = 100;
    pubkey[0] = 10;
    btree0.insert(id, Pubkey::new(&pubkey));
    id[1] = 101;
    pubkey[1] = 11;
    btree0.insert(id, Pubkey::new(&pubkey));
    id[2] = 102;
    pubkey[2] = 22;
    btree0.insert(id, Pubkey::new(&pubkey));
    id[3] = 103;
    pubkey[3] = 33;
    btree0.insert(id, Pubkey::new(&pubkey));
    id[4] = 104;
    pubkey[4] = 44;
    btree0.insert(id, Pubkey::new(&pubkey));

    let mut btree1 = BTreeMap::<String, Option<u32>>::new();
    btree1.insert("hello".to_string(), Some(23));
    btree1.insert("bello".to_string(), Some(33));
    btree1.insert("yello".to_string(), None);
    btree1.insert("zello".to_string(), Some(44));

    let mut btree2 = BTreeMap::<u16, String>::new();
    btree2.insert(168, "value".to_string());
    btree2.insert(169, "values".to_string());

    let wrapper = BTreeWrapper {
        map0: btree0,
        map1: btree1,
        map2: btree2,
    };

    fs::create_dir_all(TEST_DATA_DIRECTORY).unwrap();
    let mut file =
        fs::File::create(String::from(TEST_DATA_DIRECTORY) + "/test_btree.json").unwrap();

    write!(file, "{:?}", wrapper.try_to_vec().unwrap()).unwrap();

    let data = &[
        5, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 100, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 101, 102, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 101, 102, 103, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 22, 33, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 101,
        102, 103, 104, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 10, 11, 22, 33, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 104, 101, 108, 108, 111, 1, 23, 0, 0, 0, 5, 0, 0, 0,
        98, 101, 108, 108, 111, 1, 33, 0, 0, 0, 5, 0, 0, 0, 121, 101, 108, 108, 111, 0, 5, 0, 0, 0,
        122, 101, 108, 108, 111, 1, 44, 0, 0, 0, 2, 0, 0, 0, 168, 0, 5, 0, 0, 0, 118, 97, 108, 117,
        101, 169, 0, 6, 0, 0, 0, 118, 97, 108, 117, 101, 115,
    ];

    let wrapper_de = try_from_slice_unchecked::<BTreeWrapper>(data).unwrap();

    for ((key, val), (key_de, val_de)) in wrapper.map0.iter().zip(wrapper_de.map0.iter()) {
        assert_eq!(key, key_de);
        assert_eq!(val, val_de);
    }

    for ((key, val), (key_de, val_de)) in wrapper.map1.iter().zip(wrapper_de.map1.iter()) {
        assert_eq!(key, key_de);
        assert_eq!(val, val_de);
    }

    for ((key, val), (key_de, val_de)) in wrapper.map2.iter().zip(wrapper_de.map2.iter()) {
        assert_eq!(key, key_de);
        assert_eq!(val, val_de);
    }
}
