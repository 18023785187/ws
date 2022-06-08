/**
 * 信息发送模板
 */
function sendTemp(type, data) {
  return JSON.stringify({
    type,
    data
  })
}

module.exports = sendTemp
