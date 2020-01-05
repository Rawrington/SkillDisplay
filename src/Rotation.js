import React from "react"
import "./css/Rotation.css"
import Action from "./Action"

export default function RotationContainer({ encounterId, name, actionList, saveOpenerFn }) {
	const [open, setOpen] = React.useState(false)

	return (
		<>
			<button
				className={open ? "rotation-button expanded" : "rotation-button"}
				onClick={() => {
					setOpen(open => !open)
				}}
			>
				{encounterId === 0 ? "Current Rotation" : name}
			</button>
			<RotationContents expanded={open} actionList={actionList} />
			<SaveAsOpener expanded={open} actionList={actionList} saveOpenerFn={saveOpenerFn} />
		</>
	)
}

function RotationContents({ expanded, actionList }) {
	if (!expanded) return null

	return (
		<div className="rotation-list">
			{actionList.map((action, i) => (
				<Action key={i} actionId={action} additionalClasses="action-rotation" />
			))}
		</div>
	)
}

function SaveAsOpener({ expanded, actionList, saveOpenerFn }) {
	if (!expanded) return null

	return (
		<button
			onClick={() => {
				saveOpenerFn(actionList);
			}}
		>
			Save as Opener
		</button>
	)
}
