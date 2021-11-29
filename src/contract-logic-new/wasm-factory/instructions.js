let imports = {}
imports["__wbindgen_placeholder__"] = module.exports
let wasm
const { TextDecoder } = require(`util`)

let cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })

cachedTextDecoder.decode()

let cachegetUint8Memory0 = null
function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer)
  }
  return cachegetUint8Memory0
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len))
}

let WASM_VECTOR_LEN = 0

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1)
  getUint8Memory0().set(arg, ptr / 1)
  WASM_VECTOR_LEN = arg.length
  return ptr
}

let cachegetInt32Memory0 = null
function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer)
  }
  return cachegetInt32Memory0
}
/**
 * @param {Uint8Array} serialized_input
 * @returns {string}
 */
module.exports.initAuction = function (serialized_input) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
    var ptr0 = passArray8ToWasm0(serialized_input, wasm.__wbindgen_malloc)
    var len0 = WASM_VECTOR_LEN
    wasm.initAuction(retptr, ptr0, len0)
    var r0 = getInt32Memory0()[retptr / 4 + 0]
    var r1 = getInt32Memory0()[retptr / 4 + 1]
    return getStringFromWasm0(r0, r1)
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16)
    wasm.__wbindgen_free(r0, r1)
  }
}

/**
 * @param {Uint8Array} serialized_input
 * @returns {string}
 */
module.exports.freezeAuction = function (serialized_input) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
    var ptr0 = passArray8ToWasm0(serialized_input, wasm.__wbindgen_malloc)
    var len0 = WASM_VECTOR_LEN
    wasm.freezeAuction(retptr, ptr0, len0)
    var r0 = getInt32Memory0()[retptr / 4 + 0]
    var r1 = getInt32Memory0()[retptr / 4 + 1]
    return getStringFromWasm0(r0, r1)
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16)
    wasm.__wbindgen_free(r0, r1)
  }
}

/**
 * @param {Uint8Array} serialized_input
 * @returns {string}
 */
module.exports.placeBid = function (serialized_input) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
    var ptr0 = passArray8ToWasm0(serialized_input, wasm.__wbindgen_malloc)
    var len0 = WASM_VECTOR_LEN
    wasm.placeBid(retptr, ptr0, len0)
    var r0 = getInt32Memory0()[retptr / 4 + 0]
    var r1 = getInt32Memory0()[retptr / 4 + 1]
    return getStringFromWasm0(r0, r1)
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16)
    wasm.__wbindgen_free(r0, r1)
  }
}

/**
 * @param {Uint8Array} serialized_input
 * @returns {string}
 */
module.exports.claimFunds = function (serialized_input) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
    var ptr0 = passArray8ToWasm0(serialized_input, wasm.__wbindgen_malloc)
    var len0 = WASM_VECTOR_LEN
    wasm.claimFunds(retptr, ptr0, len0)
    var r0 = getInt32Memory0()[retptr / 4 + 0]
    var r1 = getInt32Memory0()[retptr / 4 + 1]
    return getStringFromWasm0(r0, r1)
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16)
    wasm.__wbindgen_free(r0, r1)
  }
}

/**
 * @param {Uint8Array} serialized_input
 * @returns {string}
 */
module.exports.deleteAuction = function (serialized_input) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
    var ptr0 = passArray8ToWasm0(serialized_input, wasm.__wbindgen_malloc)
    var len0 = WASM_VECTOR_LEN
    wasm.deleteAuction(retptr, ptr0, len0)
    var r0 = getInt32Memory0()[retptr / 4 + 0]
    var r1 = getInt32Memory0()[retptr / 4 + 1]
    return getStringFromWasm0(r0, r1)
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16)
    wasm.__wbindgen_free(r0, r1)
  }
}

/**
 * @param {Uint8Array} serialized_input
 * @returns {string}
 */
module.exports.initContract = function (serialized_input) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
    var ptr0 = passArray8ToWasm0(serialized_input, wasm.__wbindgen_malloc)
    var len0 = WASM_VECTOR_LEN
    wasm.initContract(retptr, ptr0, len0)
    var r0 = getInt32Memory0()[retptr / 4 + 0]
    var r1 = getInt32Memory0()[retptr / 4 + 1]
    return getStringFromWasm0(r0, r1)
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16)
    wasm.__wbindgen_free(r0, r1)
  }
}

module.exports.__wbindgen_throw = function (arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1))
}

const path = require("path").join(__dirname, "instructions_bg.wasm")
const bytes = require("fs").readFileSync(path)

const wasmModule = new WebAssembly.Module(bytes)
const wasmInstance = new WebAssembly.Instance(wasmModule, imports)
wasm = wasmInstance.exports
module.exports.__wasm = wasm
