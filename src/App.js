import React from "react"
import listenToACT from "./ACTListener"
import "./css/App.css"
import Action from "./Action"
import RotationContainer from "./Rotation"
import ReactDOM from "react-dom"

const handleCodes = new Set(["00", "01", "02", "21", "22", "33"])

export default function App() {
	const [actionList, setActionList] = React.useState([])
	const [encounterList, setEncounterList] = React.useState([])

	React.useEffect(() => {
		let selfId
		let lastTimestamp = ""
		let lastAction = -1
		let currentZone = "Unknown"

		let lastKey = 1

		let closeFn = listenToACT((...logSplit) => {
			const openNewEncounter = () => {
				setEncounterList(encounterList => {
					if (
						encounterList[0] &&
						encounterList[0].rotation &&
						encounterList[0].rotation.length <= 0
					) {
						encounterList.shift()
					}

					encounterList.unshift({
						name: currentZone,
						rotation: []
					})

					return encounterList.slice(0, 3)
				})
			}

			if (logSplit.length === 1 && logSplit[0].charID) {
				selfId = logSplit[0].charID
				openNewEncounter()
				return
			}

			const [
				logCode,
				logTimestamp,
				logParameter1,
				logParameter2,
				logParameter3
			] = logSplit

			if (!handleCodes.has(logCode)) return

			switch (logCode) {
				case "00":
					if (logParameter1 === "0038" && logParameter3 === "end")
						openNewEncounter()
					return
				case "01":
					currentZone = logParameter2
					return
				case "02":
					selfId = parseInt(logParameter1, 16)
					openNewEncounter()
					return
				case "33":
					if (logParameter2 === "40000012" || logParameter2 === "40000010")
						openNewEncounter()
					return
				default:
					break
			}

			if (selfId === undefined) return

			if (parseInt(logParameter1, 16) !== selfId) return

			const action = parseInt(logParameter3, 16)

			if ( //sanity check the tea sis period wig snapped
				((action < 9 || action > 20000) && //is not a combat action
                (action < 100001 || action > 100300)) || //and is not a crafting action
				(logTimestamp === lastTimestamp && action === lastAction) //or this action is a bug/duplicate
			)
				return

			if (Date.now() - Date.parse(lastTimestamp) > 120000) openNewEncounter() //last action > 120s ago

			lastTimestamp = logTimestamp
			lastAction = action

			const key = (lastKey % 256) + 1
			lastKey = key

			// This is pretty silly but it's the neatest way to handle the updates going
			// out at the same time, without finding some way to merge the action lists....
			ReactDOM.unstable_batchedUpdates(() => {
				setActionList(actionList => actionList.concat({ action, key }))
				setEncounterList(encounterList => {
					if (!encounterList[0]) {
						encounterList[0] = {
							name: currentZone,
							rotation: []
						}
					}

					encounterList[0].rotation.push(action)

					return encounterList
				})
			})

			setTimeout(() => {
				setActionList(actionList => actionList.slice(1))
			}, 10000)
		})

		return () => {
			closeFn()
		}
	}, [])

	return (
		<>
			<div className="container">
				<div className="actions">
					{actionList.map(({ action, key }) => (
						<Action
							key={key}
							actionId={action}
							additionalClasses="action-move"
						/>
					))}
				</div>
				{encounterList.map((encounter, i) => (
					<RotationContainer
						key={i}
						encounterId={i}
						name={encounter.name}
						actionList={encounter.rotation}
					/>
				))}
			</div>
		</>
	)
}
