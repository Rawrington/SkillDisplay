export default function listenActWebSocket(callback) {
	const url = new URLSearchParams(window.location.search)
	const wsUri = `${url.get('HOST_PORT')}BeforeLogLineRead` || undefined
	const ws = new WebSocket(wsUri)
	ws.onerror = () => listenActWebSocket()
	ws.onmessage = function (e, m) { //PING
		if (e.data === '.') return ws.send('.') //PONG
		
		const obj = JSON.parse(e.data)
		if(obj.msgtype === 'SendCharName')
		{
			return callback(obj.msg)
		}
		else if(obj.msgtype === 'Chat')
		{
			const code = obj.msg.substring(0, 2) //first 2 numbers POG

			if(code === '21' || code === '22') return callback(obj.msg) //NetworkAbility or NetworkAoeAbility
		}
	}
}