import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { borshPublicKey } from "./extensions/publicKey";
import { Struct } from "./extensions/struct";
import { Enum } from "./extensions/enum";

borshPublicKey();

export class BTreeWrapper extends Struct {
	map0: Map<[32], PublicKey>;
	map1: Map<string, number | null>;
	map2: Map<number, string>;
};

export class TestStruct extends Struct {
	fieldA: BN;
	fieldB: number;
	fieldC: OtherState[] | null;
};

export class OtherState extends Struct {
	amount: BN;
	timestamp: BN;
};

export class RandomStruct extends Struct {
	fieldA: string;
	fieldB: [2] | null;
};

export class TestEnum extends Enum {
	testEnumVariantA: TestEnumVariantA;
	testEnumVariantB: TestEnumVariantB;
	testEnumVariantC: TestEnumVariantC;
	testEnumVariantD: TestEnumVariantD;
	testEnumVariantE: TestEnumVariantE;
	testEnumVariantF: TestEnumVariantF;
	testEnumVariantG: TestEnumVariantG;
};

export class TestEnumVariantA extends Struct {
};

export class TestEnumVariantB extends Struct {
};

export class TestEnumVariantC extends Struct {
	unnamed: BN;
};

export class TestEnumVariantD extends Struct {
	unnamed: PublicKey | null;
};

export class TestEnumVariantE extends Struct {
	unnamed: number | null;
};

export class TestEnumVariantF extends Struct {
	unnamed: RandomStruct;
};

export class TestEnumVariantG extends Struct {
	hello: number[];
	bello: PublicKey[];
	yello: number;
	zello: boolean;
};

export const SCHEMA = new Map<any, any>([
    [
            BTreeWrapper,
            {
                kind: 'struct', fields: [
			['map0', { kind: 'map', key: [32], value: 'publicKey' }],
			['map1', { kind: 'map', key: 'string', value: { kind: 'option', type: 'u32' } }],
			['map2', { kind: 'map', key: 'u16', value: 'string' }],
                ],
            },
    ],
    [
            TestStruct,
            {
                kind: 'struct', fields: [
			['fieldA', 'u64'],
			['fieldB', 'u8'],
			['fieldC', { kind: 'option', type: [OtherState] }],
                ],
            },
    ],
    [
            OtherState,
            {
                kind: 'struct', fields: [
			['amount', 'u64'],
			['timestamp', 'u64'],
                ],
            },
    ],
    [
            RandomStruct,
            {
                kind: 'struct', fields: [
			['fieldA', 'string'],
			['fieldB', { kind: 'option', type: [2] }],
                ],
            },
    ],
    [
            TestEnum,
            {
                kind: 'enum', field: 'enum', values: [
			['testEnumVariantA', TestEnumVariantA],
			['testEnumVariantB', TestEnumVariantB],
			['testEnumVariantC', TestEnumVariantC],
			['testEnumVariantD', TestEnumVariantD],
			['testEnumVariantE', TestEnumVariantE],
			['testEnumVariantF', TestEnumVariantF],
			['testEnumVariantG', TestEnumVariantG],
                ],
            },
    ],
    [
            TestEnumVariantA,
            {
                kind: 'struct', fields: [
                ],
            },
    ],
    [
            TestEnumVariantB,
            {
                kind: 'struct', fields: [
                ],
            },
    ],
    [
            TestEnumVariantC,
            {
                kind: 'struct', fields: [
			['unnamed', 'u64'],
                ],
            },
    ],
    [
            TestEnumVariantD,
            {
                kind: 'struct', fields: [
			['unnamed', { kind: 'option', type: 'publicKey' }],
                ],
            },
    ],
    [
            TestEnumVariantE,
            {
                kind: 'struct', fields: [
			['unnamed', { kind: 'option', type: 'u8' }],
                ],
            },
    ],
    [
            TestEnumVariantF,
            {
                kind: 'struct', fields: [
			['unnamed', RandomStruct],
                ],
            },
    ],
    [
            TestEnumVariantG,
            {
                kind: 'struct', fields: [
			['hello', ['u8']],
			['bello', ['publicKey', 3]],
			['yello', 'u16'],
			['zello', 'u8'],
                ],
            },
    ],
]);