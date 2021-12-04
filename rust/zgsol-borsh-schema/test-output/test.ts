import {
    BTreeWrapper,
    OtherState,
    RandomStruct,
    TestStruct,
    TestEnum,
    TestEnumVariantA,
    TestEnumVariantB,
    TestEnumVariantC,
    TestEnumVariantD,
    TestEnumVariantE,
    TestEnumVariantF,
    TestEnumVariantG,
    SCHEMA
} from "./schema";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { serialize, deserializeUnchecked } from "borsh";

// Read serialized data from rust
const assert = require("assert");
const fs = require("fs");
var data = fs.readFileSync("../test-data/test_structs.json");
const structData = JSON.parse(data.toString());
var data = fs.readFileSync("../test-data/test_enums.json");
const enumData = JSON.parse(data.toString());
var data = fs.readFileSync("../test-data/test_btree.json");
const btreeData = JSON.parse(data.toString());

// STRUCT TESTS
let otherStateOne = new OtherState({
    amount: new BN(1000000000),
    timestamp: new BN(1234567890),
});

let otherStateTwo = new OtherState({
    amount: new BN(2000000000),
    timestamp: new BN(1234567891),
});

let otherStateThree = new OtherState({
    amount: new BN(3000000000),
    timestamp: new BN(1234567892),
});

let testStructNone = new TestStruct(
    {
        fieldA: new BN(45678910),
        fieldB: 103,
        fieldC: null,
    }
);

let testStructSome = new TestStruct(
    {
        fieldA: new BN(10),
        fieldB: 113,
        fieldC: [otherStateOne, otherStateTwo, otherStateThree],
    }
);

// test struct with some field
const deStructSome = deserializeUnchecked(SCHEMA, TestStruct, Buffer.from(structData.testStructSome));
assert(deStructSome.fieldA.toNumber() === testStructSome.fieldA.toNumber());
assert(deStructSome.fieldB === testStructSome.fieldB);
assert(deStructSome.fieldC.length === 3);
assert(deStructSome.fieldC[0].amount.toNumber() === otherStateOne.amount.toNumber());
assert(deStructSome.fieldC[0].timestamp.toNumber() === otherStateOne.timestamp.toNumber());
assert(deStructSome.fieldC[1].amount.toNumber() === otherStateTwo.amount.toNumber());
assert(deStructSome.fieldC[1].timestamp.toNumber() === otherStateTwo.timestamp.toNumber());
assert(deStructSome.fieldC[2].amount.toNumber() === otherStateThree.amount.toNumber());
assert(deStructSome.fieldC[2].timestamp.toNumber() === otherStateThree.timestamp.toNumber());

const serStructSome = Array.from(serialize(SCHEMA, testStructSome));
assert(serStructSome.length === structData.testStructSome.length);
for (var i = 0; i < serStructSome.length; i++) {
    assert(serStructSome[i] === structData.testStructSome[i]);
}
// test struct with none field
const deStructNone = deserializeUnchecked(SCHEMA, TestStruct, Buffer.from(structData.testStructNone));
assert(deStructNone.fieldA.toNumber() === testStructNone.fieldA.toNumber());
assert(deStructNone.fieldB === testStructNone.fieldB);
assert(deStructNone.fieldC == null);

const serStructNone = Array.from(serialize(SCHEMA, testStructNone));
assert(serStructNone.length === structData.testStructNone.length);
for (var i = 0; i < serStructNone.length; i++) {
    assert(serStructNone[i] === structData.testStructNone[i]);
}

// ENUM TESTS
const testEnumVariantA = new TestEnumVariantA({});
const testEnumVariantB = new TestEnumVariantB({});
const testEnumVariantC = new TestEnumVariantC({
    unnamed: new BN(1234567890)
});
const testEnumVariantD = new TestEnumVariantD({
    unnamed: new PublicKey(12)
});
const testEnumVariantE = new TestEnumVariantE({
    unnamed: null
});
const testEnumVariantF = new TestEnumVariantF({
    unnamed: new RandomStruct({
        fieldA: "a test string",
        fieldB: Uint8Array.from([5, 6]),
    })
});
const testEnumVariantG = new TestEnumVariantG({
    hello: new Array(1, 2, 3, 4, 5),
    bello: new Array(new PublicKey(22), new PublicKey(23), new PublicKey(24)),
    yello: 234,
    zello: false,
});

const enumVariantA = new TestEnum({ testEnumVariantA });
const enumVariantB = new TestEnum({ testEnumVariantB });
const enumVariantC = new TestEnum({ testEnumVariantC });
const enumVariantD = new TestEnum({ testEnumVariantD });
const enumVariantE = new TestEnum({ testEnumVariantE });
const enumVariantF = new TestEnum({ testEnumVariantF });
const enumVariantG = new TestEnum({ testEnumVariantG });

const serEnumVariantA = Array.from(serialize(SCHEMA, enumVariantA));
assert(serEnumVariantA.length === enumData.enumVariantA.length);
for (var i = 0; i < serEnumVariantA.length; i++) {
    assert(serEnumVariantA[i] === enumData.enumVariantA[i])
}
const serEnumVariantB = Array.from(serialize(SCHEMA, enumVariantB));
assert(serEnumVariantB.length === enumData.enumVariantB.length);
for (var i = 0; i < serEnumVariantB.length; i++) {
    assert(serEnumVariantB[i] === enumData.enumVariantB[i])
}
const serEnumVariantC = Array.from(serialize(SCHEMA, enumVariantC));
assert(serEnumVariantC.length === enumData.enumVariantC.length);
for (var i = 0; i < serEnumVariantC.length; i++) {
    assert(serEnumVariantC[i] === enumData.enumVariantC[i])
}
const serEnumVariantD = Array.from(serialize(SCHEMA, enumVariantD));
assert(serEnumVariantD.length === enumData.enumVariantD.length);
for (var i = 0; i < serEnumVariantD.length; i++) {
    assert(serEnumVariantD[i] === enumData.enumVariantD[i])
}
const serEnumVariantE = Array.from(serialize(SCHEMA, enumVariantE));
assert(serEnumVariantE.length === enumData.enumVariantE.length);
for (var i = 0; i < serEnumVariantE.length; i++) {
    assert(serEnumVariantE[i] === enumData.enumVariantE[i])
}
const serEnumVariantF = Array.from(serialize(SCHEMA, enumVariantF));
assert(serEnumVariantF.length === enumData.enumVariantF.length);
for (var i = 0; i < serEnumVariantF.length; i++) {
    assert(serEnumVariantF[i] === enumData.enumVariantF[i])
}
const serEnumVariantG = Array.from(serialize(SCHEMA, enumVariantG));
assert(serEnumVariantG.length === enumData.enumVariantG.length);
for (var i = 0; i < serEnumVariantG.length; i++) {
    assert(serEnumVariantG[i] === enumData.enumVariantG[i])
}

const deEnumVariantA = deserializeUnchecked(
    SCHEMA,
    TestEnum,
    Buffer.from(enumData.enumVariantA)
);
const deEnumVariantB = deserializeUnchecked(
    SCHEMA,
    TestEnum,
    Buffer.from(enumData.enumVariantB)
);
const deEnumVariantC = deserializeUnchecked(
    SCHEMA,
    TestEnum,
    Buffer.from(enumData.enumVariantC)
);
const deEnumVariantD = deserializeUnchecked(
    SCHEMA,
    TestEnum,
    Buffer.from(enumData.enumVariantD)
);
const deEnumVariantE = deserializeUnchecked(
    SCHEMA,
    TestEnum,
    Buffer.from(enumData.enumVariantE)
);
const deEnumVariantF = deserializeUnchecked(
    SCHEMA,
    TestEnum,
    Buffer.from(enumData.enumVariantF)
);
const deEnumVariantG = deserializeUnchecked(
    SCHEMA,
    TestEnum,
    Buffer.from(enumData.enumVariantG)
);

assert(deEnumVariantA.enum === enumVariantA.enum);
assert(deEnumVariantB.enum === enumVariantB.enum);
assert(deEnumVariantC.enum === enumVariantC.enum);
assert(deEnumVariantD.enum === enumVariantD.enum);
assert(deEnumVariantE.enum === enumVariantE.enum);
assert(deEnumVariantF.enum === enumVariantF.enum);
assert(deEnumVariantG.enum === enumVariantG.enum);

assert(deEnumVariantC.testEnumVariantC.unnamed.toNumber()
    === enumVariantC.testEnumVariantC.unnamed.toNumber());
assert(deEnumVariantD.testEnumVariantD.unnamed.toString()
    === enumVariantD.testEnumVariantD.unnamed.toString());
assert(deEnumVariantE.testEnumVariantE.unnamed
    == enumVariantE.testEnumVariantE.unnamed);
assert(deEnumVariantF.testEnumVariantF.unnamed.fieldA
    === enumVariantF.testEnumVariantF.unnamed.fieldA);
for (var i = 0; i < deEnumVariantF.testEnumVariantF.unnamed.fieldB.length; i++) {
    assert(deEnumVariantF.testEnumVariantF.unnamed.fieldB[i]
        === enumVariantF.testEnumVariantF.unnamed.fieldB[i]);
}

for (var i = 0; i < deEnumVariantG.testEnumVariantG.hello.length; i++) {
    assert(deEnumVariantG.testEnumVariantG.hello[i]
        === enumVariantG.testEnumVariantG.hello[i]);
}
for (var i = 0; i < deEnumVariantG.testEnumVariantG.bello.length; i++) {
    assert(deEnumVariantG.testEnumVariantG.bello[i].toString()
        === enumVariantG.testEnumVariantG.bello[i].toString());
}
assert(deEnumVariantG.testEnumVariantG.yello === enumVariantG.testEnumVariantG.yello);
assert(!deEnumVariantG.testEnumVariantG.zello);

// MAP TESTS
let pubkey = [
    10, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0
];
const id0 = [
    100, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0
];

let map0 = new Map();
const pubkey0 = new PublicKey(pubkey);
map0.set(id0, pubkey0);
const id1 = [
    100, 101, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0
];
pubkey[1] = 11;
const pubkey1 = new PublicKey(pubkey);
map0.set(id1, pubkey1);
const id2 = [
    100, 101, 102, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0
];
pubkey[2] = 22;
const pubkey2 = new PublicKey(pubkey);
map0.set(id2, pubkey2);
const id3 = [
    100, 101, 102, 103, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0
];
pubkey[3] = 33;
const pubkey3 = new PublicKey(pubkey);
map0.set(id3, pubkey3);
const id4 = [
    100, 101, 102, 103, 104, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0
];
pubkey[4] = 44;
const pubkey4 = new PublicKey(pubkey);
map0.set(id4, pubkey4);

let map1 = new Map();
map1.set("hello", 23);
map1.set("bello", 33);
map1.set("yello", null);
map1.set("zello", 44);

let map2 = new Map();
map2.set(168, "value");
map2.set(169, "values");

const wrapper = new BTreeWrapper({ map0, map1, map2 });
const serialized = serialize(SCHEMA, wrapper);
assert(serialized.length === btreeData.length);
const wrapperDeserialized = deserializeUnchecked(SCHEMA, BTreeWrapper, Buffer.from(btreeData));

let entries = wrapperDeserialized.map0.entries();
var [key, value] = entries.next().value;
assert(key.toString() === id0.toString());
assert(value.toString() === pubkey0.toString());
var [key, value] = entries.next().value;
assert(key.toString() === id1.toString());
assert(value.toString() === pubkey1.toString());
var [key, value] = entries.next().value;
assert(key.toString() === id2.toString());
assert(value.toString() === pubkey2.toString());
var [key, value] = entries.next().value;
assert(key.toString() === id3.toString());
assert(value.toString() === pubkey3.toString());
var [key, value] = entries.next().value;
assert(key.toString() === id4.toString());
assert(value.toString() === pubkey4.toString());

assert(wrapperDeserialized.map1.get("hello") === 23);
assert(wrapperDeserialized.map1.get("bello") === 33);
assert(wrapperDeserialized.map1.get("yello") == null);
assert(wrapperDeserialized.map1.get("zello") === 44);
assert(wrapperDeserialized.map2.get(168) === "value");
assert(wrapperDeserialized.map2.get(169) === "values");
