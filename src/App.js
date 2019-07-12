import React from 'react'
import listenActWebSocket from './ACTWebsocket'
import './css/App.css'
import Action from './Action'
import RotationContainer from './Rotation'
import ReactDOM from 'react-dom'

export default function App() {
	// NOTE: unlike class state, useState doesn't do object merging; instead, it directly holds values
	const [actionList, setActionList] = React.useState([])
	const [encounterList, setEncounterList] = React.useState([])

	React.useEffect(() => {
		
		// These values are only used internally by the handler,
		// we don't need to notify React that they were updated,
		// or keep their updates synchronized with actionList updates.
		//
		// This means we don't have to keep them in State (or Reducer)!
		let selfId
		let lastTimestamp = ''
		let lastAction = -1
		let currentZone = 'Unknown'

		// we need keys to persist for each push, even if we shorten the array later,
		// so we store the key with the action; can't just use array index due to CSS
		let lastKey = 1

		// listenActWebSocket should be changed to return the websocket,
		// and this effect should return a function that disconnects the websocket
		//
		// like "return () => { ws.close() }"
		let ws = listenActWebSocket((data, code) => {
			const openNewEncounter = (timestamp) => {
				setEncounterList(encounterList => {
					if(encounterList[0] && encounterList[0].rotation && encounterList[0].rotation.length <= 0) {
						encounterList.shift()
					}
					
					encounterList.unshift({
						name: currentZone,
						rotation: []
					})
					
					return encounterList.slice(0,3)
				})
			}
			
			if (data.charID) {
				selfId = data.charID
				openNewEncounter()
				return
			}
			
			switch(code) {
				case '00':
					const [, , refCode, , message] = data.split('|')
					if(refCode === '0038' && message === 'end') openNewEncounter()
					return
				case '01':
					const [, , , zoneName] = data.split('|')
					currentZone = zoneName
					return
				case '02':
					const [, , logCharIdHex] = data.split('|')
					selfId = parseInt(logCharIdHex, 16)
					openNewEncounter()
					return
				case '33':
					const [, , , controlCode] = data.split('|')
					if(controlCode === '40000012' || controlCode === '40000010') openNewEncounter()
					return
				default:
					break
			}
			
			//if it's not any of these it must be Network(AOE)Ability, the bulk of what we want to handle

			if (selfId === undefined) return

			const [, logTimestamp, logCharIdHex, , logActionIdHex] = data.split('|')

			// microoptimization: since selfId updates way less often,
			// save selfId as data.charID.toString(16), that way you don't need to
			// parse logCharIdHex every time
			if (parseInt(logCharIdHex, 16) !== selfId) return

			// we do a mathematical comparison with action though so can't optimize this away
			const action = parseInt(logActionIdHex, 16)

			if (
				action <= 8 ||
				(logTimestamp === lastTimestamp && action === lastAction)
			)
				return
				
			if((Date.now() - Date.parse(lastTimestamp)) > 120000) openNewEncounter()//last action > 120s ago

			lastTimestamp = logTimestamp
			lastAction = action

			const key = (lastKey % 256) + 1
			lastKey = key

			ReactDOM.unstable_batchedUpdates(() => {
				setActionList(actionList => actionList.concat({ action, key }))
				setEncounterList(encounterList => {
					if(!encounterList[0]) {
						encounterList[0] = {
							name: currentZone,
							rotation: []
						}
					}
				
					encounterList[0].rotation.push( action )
				
					return encounterList
				})
			})

			// This _probably_ should be done as a separate React.useEffect instead,
			// which runs as an effect whenever the value of actionList changes.
			// The problem there is, it would have to detect whether the list grew
			// since the last time it was called, otherwise it'd react (heh) to its own
			// updates.
			//
			// Easier to pair it with the previous set.
			setTimeout(() => {
				setActionList(actionList => actionList.slice(1))
			}, 10000)
		})
		
		return () => { ws.close() }
	}, [])

	return (
		<div className='container'>
			<div className='actions'>
				{actionList.map(({ action, key }) => (
					<Action key={key} actionId={action} additionalClasses='action-move' />
				))}
			</div>
			{encounterList.map((encounter, i) => (
				<RotationContainer key={i} encounterId={i} name={encounter.name} actionList={encounter.rotation} />
			))}
		</div>
	)
}

