import React from 'react'
import listenActWebSocket from './ACTWebsocket'
import './css/App.css'
import Action from './Action'

class App extends React.Component {
	state = {
		me: 0,
		actionlist: [],
		actionindex: 1
	}
	
	constructor(props) {
		super(props)
		
		listenActWebSocket(this.handleLogEvent.bind(this))
	}
	
	addActionToOverlay(action_id) {
		this.setState((state) => {
			const actionlist = state.actionlist.concat(action_id);
		
			return {actionlist}
		})
	}
	
	handleLogEvent(data) {
		if(data.charID) {
			this.setState({me: data.charID})
			return
		} //the ME data we need
		
		const me = this.state.me
		
		if(me === 0) return //we need data on the character first
		
		let log = data.split('|')
		
		if(parseInt(log[2],16) !== me) return //we only care about our actions
		
		const action = parseInt(log[4],16)
		
		if(action <= 8) return //things we don't care about
		
		const index = this.state.actionindex
		
		this.addActionToOverlay({index,action})
		
		this.setState((state) => {
			const actionindex = (state.actionindex >= 32)?1:state.actionindex+1
			
			return {actionindex}
		})
		
		setTimeout(this.purgeAction.bind(this), 10000)
	}
	
	purgeAction() {
		this.setState((state) => {
			const actionlist = state.actionlist.slice(1)
			
			return {actionlist}
		})
	}
	
	render() {
		let actions = []
		
		console.log(this.state.actionlist)
		
		for (const id in this.state.actionlist) {
			const action = this.state.actionlist[id]
			actions.push(<Action key={action.index} action_id={action.action} />)
		}
		
		return <div className="actions">{actions}</div>
	}
}

export default App;
