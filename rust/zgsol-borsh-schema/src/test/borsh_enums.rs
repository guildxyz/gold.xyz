use super::TEST_DATA_DIRECTORY;
use crate::*;

use borsh::{BorshDeserialize, BorshSerialize};
use serde::Serialize;
use solana_program::pubkey::Pubkey;

use std::fs;
use std::io::Write;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TestData {
    enum_variant_a: Vec<u8>,
    enum_variant_b: Vec<u8>,
    enum_variant_c: Vec<u8>,
    enum_variant_d: Vec<u8>,
    enum_variant_e: Vec<u8>,
    enum_variant_f: Vec<u8>,
    enum_variant_g: Vec<u8>,
}

#[derive(BorshSchema, BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct RandomStruct {
    field_a: String,
    field_b: Option<[u8; 2]>,
}

#[allow(clippy::enum_variant_names)]
#[derive(BorshSchema, BorshSerialize, BorshDeserialize, Clone, Debug)]
pub enum TestEnum {
    VariantA,
    VariantB,
    VariantC(u64),
    VariantD(Option<Pubkey>),
    VariantE(Option<u8>),
    VariantF(RandomStruct),
    VariantG {
        hello: Vec<u8>,
        bello: [Pubkey; 3],
        yello: u16,
        zello: bool,
    },
}

#[test]
fn generate_layout_from_this_file() {
    let layouts = generate_layout_from_file("src/test/borsh_enums.rs").unwrap();
    assert_eq!(layouts.len(), 9);
    assert_eq!(layouts[0].name, "RandomStruct");
    assert_eq!(layouts[1].name, "TestEnum");
    assert_eq!(layouts[2].name, "TestEnumVariantA");
    assert_eq!(layouts[3].name, "TestEnumVariantB");
    assert_eq!(layouts[4].name, "TestEnumVariantC");
    assert_eq!(layouts[5].name, "TestEnumVariantD");
    assert_eq!(layouts[6].name, "TestEnumVariantE");
    assert_eq!(layouts[7].name, "TestEnumVariantF");

    let mut pubkey_array = [0; 32];
    pubkey_array[31] = 12;
    let enum_variant_a = TestEnum::VariantA;
    let enum_variant_b = TestEnum::VariantB;
    let enum_variant_c = TestEnum::VariantC(1234567890);
    let enum_variant_d = TestEnum::VariantD(Some(Pubkey::new(&pubkey_array)));
    let enum_variant_e = TestEnum::VariantE(None);
    let enum_variant_f = TestEnum::VariantF(RandomStruct {
        field_a: "a test string".to_string(),
        field_b: Some([5, 6]),
    });

    pubkey_array[31] = 22;
    let pubkey_0 = Pubkey::new(&pubkey_array);
    pubkey_array[31] = 23;
    let pubkey_1 = Pubkey::new(&pubkey_array);
    pubkey_array[31] = 24;
    let pubkey_2 = Pubkey::new(&pubkey_array);

    let enum_variant_g = TestEnum::VariantG {
        hello: vec![1, 2, 3, 4, 5],
        bello: [pubkey_0, pubkey_1, pubkey_2],
        yello: 234,
        zello: false,
    };

    let test_data = TestData {
        enum_variant_a: enum_variant_a.try_to_vec().unwrap(),
        enum_variant_b: enum_variant_b.try_to_vec().unwrap(),
        enum_variant_c: enum_variant_c.try_to_vec().unwrap(),
        enum_variant_d: enum_variant_d.try_to_vec().unwrap(),
        enum_variant_e: enum_variant_e.try_to_vec().unwrap(),
        enum_variant_f: enum_variant_f.try_to_vec().unwrap(),
        enum_variant_g: enum_variant_g.try_to_vec().unwrap(),
    };

    fs::create_dir_all(TEST_DATA_DIRECTORY).unwrap();
    let mut file =
        fs::File::create(String::from(TEST_DATA_DIRECTORY) + "/test_enums.json").unwrap();
    write!(file, "{}", serde_json::to_string(&test_data).unwrap()).unwrap();
}
