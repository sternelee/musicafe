import React, { Component } from 'react';
import { Icon, Button, notification } from 'antd';

const styles = {
	leftPanelLogin:{
		position: 'absolute',
		left: '0',
		top:'20px',
		width:'100%',
		height:'40px',
		overflow:'hidden',
	},
	loginBtn:{
		float:'right',
		marginRight:'20px',
		backgroundColor:'transparent',
		color:'#fff',
		fontSize:'14px',
	}
}

class Login extends Component{

	constructor(props){
		super(props);
		this.state = {
			isLogin: false,
			userName: '',
			users:[]
		}
	}

	render(){
		const { userName, userId } = this.state;
		return(
			<div style={styles.leftPanelLogin}>
					{ !userId ? <Button style={styles.loginBtn}>
						<Icon type="user" />未登陆
					</Button> : <Button style={styles.loginBtn}>{userName} <Icon type="logout" /> </Button>}
			</div>
		)
	}
}

export default Login;
// const mapStateToProps = (state) => {
// 	return {
// 		userId: state.userId,
// 		userName: state.userName,
// 	}
// }

// const mapDispatchToProps = (dispatch) => {
// 	return {
// 		updateLoginState: (status) => {
// 			dispatch({type: 'LOGIN_STATUS_UPDATE', status})
// 		}
// 	}
// }