import React from "react"
import "./css/Rotation.css"
import "./css/Opener.css"
import Action from "./Action"

export default function OpenerContainer({ openerActionList, actionList }) {
	const [open, setOpen] = React.useState(true)

	if (openerActionList.length === 0) return null
	let header = (
		<button
			className={open ? "rotation-button expanded" : "rotation-button"}
			onClick={() => {
				setOpen(open => !open)
			}}
		>
			Opener
		</button>
	)

	if (!open)
	{
		return (<> {header} </>)
	}

	return (
		<>
		{header}
		<h1 class="opener-header">Reference</h1>
		<OpenerReference openerActionList={openerActionList} />
		<h1 class="opener-header">Execution</h1>
		<OpenerExecution openerActionList={openerActionList} actionList={actionList} />
		</>
	)
}

function OpenerReference({ openerActionList }) {
	return (
		<div className="rotation-list">
		{openerActionList.map((action, i) => {
			return (<Action key={i} actionId={action} additionalClasses="action-rotation" />)
		})}
		</div>
	)
}

function OpenerExecution({ openerActionList, actionList }) {
	return (
		<div className="rotation-list">
		{openerActionList.map((openerAction, i) => {
			let executedAction = actionList[i]
			let classes = ["action-rotation"]
			let action = openerAction
			if (executedAction)
			{
				classes.push(openerAction === executedAction ? "opener-correct" : "opener-incorrect")
				action = executedAction
			}
			else
			{
				classes.push("opener-unexecuted")
				action = openerAction
			}
			return (<Action key={i} actionId={action} additionalClasses={classes.join(" ")} />)
		})}
		</div>
	)
}
