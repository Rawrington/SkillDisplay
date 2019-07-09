import React from 'react'
import './css/Action.css'

const gcdExceptions = [
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
]

const ogcdExceptions = [
	3559, //bard WM
	116, //bard AP
	114 //bard MB
]

class Action extends React.Component {
	state = {
		xivapi_data: []
	}
	
	constructor(props) {
		super(props);
		
		const actionUrl = "https://xivapi.com/Action/"+props.action_id;
		
		fetch(actionUrl, { mode: 'cors' })
			.then(response => response.json())
			.then(data => {this.setState({xivapi_data: data})})
	}
	
	isGCD() {
		if(ogcdExceptions.indexOf(this.props.action_id) !== -1) return false
		if(gcdExceptions.indexOf(this.props.action_id) !== -1) return true
		
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