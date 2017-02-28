import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Icon, Input } from 'antd';
import anime from 'animejs';
import socketClient from './socketClient';
var socket = require('socket.io-client')(socketClient);


class Messages extends Component{
	constructor(props){
		super(props);
		this.state = {
			visible: false,
			message:null
		}
		this.closeMessage = this.closeMessage.bind(this);
		this.handleMessage = this.handleMessage.bind(this);
	}

  closeMessage = () => {
  	this.props.closeMessage(false);
  }
  handleMessage = (e) => {
  	this.setState({
  		message: e.target.value,
  	})
  }
  sendMessageOk = () => {
  	this.props.closeMessage(false);
  	socket.emit('send', this.state.message);
  	this.setState({
  		message:null
  	});
  }
  componentDidMount() {
  	socket.on('send', function(msg){
			var span = document.createElement('span');
			span.innerHTML = msg;
			document.getElementById('root').appendChild(span);
			const max_width = window.innerWidth;
			span.style.cssText = 'position:fixed;top:'+Math.random()*500+'px;left:'+max_width+'px;font-size:60px;color:red;z-index:999;display:block;white-space:nowrap;';
			anime({
				targets: span,
				translateX: -max_width-300,
				delay:1,
				easing:'linear',
				duration:10000,
				complete: function(){
					document.getElementById('root').removeChild(span);
				}
			});
		});
  }

	render(){
		return(
				<Modal title="发弹幕啦-_--" visible={this.props.sendVisible}
		          onOk={this.sendMessageOk} onCancel={this.closeMessage}
		        >
	          <Input 
	          	placeholder="输入信息呗-_-" 
	          	prefix={<Icon type="smile-o" />} 
	          	value={this.state.message}
	          	onChange={this.handleMessage}
	          />
	        </Modal>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		sendVisible: state.playStatus.sendVisible,
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		closeMessage: (status) => {
      dispatch({type: 'SEND_MESSAGE_STATUS', status})
    }
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(Messages);