// Number to little endian bytes
export function numberToBytes(num: number) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = num & 0xff;
        byteArray [ index ] = byte;
        num = (num - byte) / 256 ;
    }

    return byteArray;
};
