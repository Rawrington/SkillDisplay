const getHost = () => /[?&]HOST_PORT=(wss?:\/\/[^&/]+)/.exec(window.location.search)

export default function listenToACT(callback) {
	if (!getHost()) return listenOverlayPlugin(callback)
	return listenActWebSocket(callback)
}

function listenActWebSocket(callback) {
	const wsUri = `${getHost()[1]}/BeforeLogLineRead` || undefined
	const ws = new WebSocket(wsUri)
	ws.onerror = () => ws.close()
	ws.onclose = () =>
		setTimeout(() => {
			listenActWebSocket(callback)
		}, 1000)
	ws.onmessage = function(e, m) {
		if (e.data === ".") return ws.send(".")

		const obj = JSON.parse(e.data)
		if (obj.msgtype === "SendCharName") {
			return callback(obj.msg)
		} else if (obj.msgtype === "Chat") {
			return callback(...obj.msg.split("|"))
		}
	}

	return () => {
		ws.close()
	}
}

function listenOverlayPlugin(callback) {
	const listener = e => {
		callback(...e.detail)
	}

	document.addEventListener("onLogLine", listener)

	return () => {
		document.removeEventListener("onLogLine", listener)
	}
}
