/**
 * ArrayBuffer转字符串
 * @param {*} arrayBuffer 
 * @param {*} chunk 对过大的文件分块传输，单位kb
 * @returns string
 */
function arrayBufferToStr(arrayBuffer, chunk = 8 * 1024) {
    let res = ''
    let i = 0
    for (i = 0; i < arrayBuffer.length / chunk; ++i) {
        res += String.fromCharCode.apply(null, arrayBuffer.slice(i * chunk, (i + 1) * chunk))
    }
    res += String.fromCharCode.apply(null, arrayBuffer.slice(i * chunk))
    return res
}

module.exports = arrayBufferToStr
