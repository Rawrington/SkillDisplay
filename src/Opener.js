import React from "react"
import "./css/Rotation.css"
import Action from "./Action"

export default function OpenerContainer({ openerActionList, actionList }) {
	if (openerActionList.length === 0) return null

	return (
		<>
			Opener
			<OpenerContents openerActionList={openerActionList} actionList={actionList} />
		</>
	)
}

function OpenerContents({ openerActionList, actionList }) {
	return (
		<div className="rotation-list">
			{openerActionList.map((action, i) => (
				<Action key={i} actionId={action} additionalClasses="action-rotation" />
			))}
		</div>
	)
}
