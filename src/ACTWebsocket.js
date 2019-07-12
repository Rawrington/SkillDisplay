const handleCodes = new Set([
	'00',
	'01',
	'02',
	'21',
	'22',
	'33'
])

export default function listenActWebSocket( callback ) {
  const url = new URLSearchParams(window.location.search)
  const wsUri = `${url.get("HOST_PORT")}BeforeLogLineRead` || undefined
  const ws = new WebSocket(wsUri)
  ws.onerror = () => ws.close()
  ws.onclose = () => setTimeout(() => { listenActWebSocket( callback ) }, 1000)
  ws.onmessage = function(e, m) {
    if (e.data === ".") return ws.send(".") //PING

    const obj = JSON.parse(e.data);
    if (obj.msgtype === "SendCharName") {
      return callback(obj.msg, null)
    } else if (obj.msgtype === "Chat") {
      const code = obj.msg.substring(0, 2) //first 2 numbers POG

      if (handleCodes.has(code)) return callback(obj.msg, code) //NetworkAbility or NetworkAoeAbility
    }
  }

  return ws
}
