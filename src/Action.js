import React from 'react'
import './css/Action.css'

class Action extends React.Component {
	state = {
		xivapi_data: []
	}
	
	constructor(props) {
		super(props);
		
		const actionUrl = "https://xivapi.com/Action/"+props.action_id;
		
		console.log(actionUrl)
		
		fetch(actionUrl, { mode: 'cors' })
			.then(response => response.json())
			.then(data => {this.setState({xivapi_data: data})})
	}
	
	shouldComponentUpdate() {
		if (Object.getOwnPropertyNames(this.state.xivapi_data).length === 0) {
			return false
		}
		return true
	}
	
	isGCD() {
		return (this.state.xivapi_data.ActionCategory.ID !== 4)
	}
	
	render() {
		if(this.state.xivapi_data.Icon) {
			const classes = this.isGCD()?'action-icon gcd':'action-icon ogcd'
			const img = "https://xivapi.com"+this.state.xivapi_data.Icon
			return <img className={classes} src={img} alt='' />
		}
		else
		{
			return null
		}
    }
}

export default Action