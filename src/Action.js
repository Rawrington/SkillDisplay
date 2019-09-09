import React from "react"
import "./css/Action.css"

const gcdOverrides = new Set([
	15997, //standard step
	15998, //technical step
	15999,
	16000,
	16001,
	16002, //step actions
	16003, //standard finish
	16004, //technical finish
	16191, //single standard finish
	16192, //double standard finish (WHY IS IT LIKE THIS)
	16193, //single technical finish
	16194, //double technical finish
	16195, //triple technical finish
	16196, //quadruple technical finish
	7418, //flamethrower
	16483 //tsubame-gaeshi
])

const ogcdOverrides = new Set([
	3559, //bard WM
	116, //bard AP
	114 //bard MB
])

export default function Action({ actionId, additionalClasses }) {
	const [apiData, setApiData] = React.useState()

	React.useEffect(() => {
		let current = true
		void (async () => {
			const data = await (await fetch(`https://xivapi.com/Action/${actionId}`, {
				mode: "cors"
			})).json()
			if (current) {
				setApiData(data)
			}
		})()

		return () => {
			current = false
		}
	}, [actionId])

	if (apiData === undefined || !apiData.Icon) {
		return null
	}

	return (
		<img
			className={
				gcdOverrides.has(actionId) ||
				(!ogcdOverrides.has(actionId) && apiData.ActionCategory.ID !== 4)
					? `gcd ${additionalClasses}`
					: `ogcd ${additionalClasses}`
			}
			src={`https://xivapi.com/${apiData.Icon}`}
			alt={apiData.Name || ""}
		/>
	)
}
