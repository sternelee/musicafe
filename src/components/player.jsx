import React, { Component } from 'react'
import { Howl } from 'howler';
import { connect } from 'react-redux';
import { getSongURL } from '../redux/action/fetch';
import { notification, Slider } from 'antd';
import socketClient from './socketClient';
var socket = require('socket.io-client')(socketClient);
// socket.on('connect', function(){
//   notification.open({
//       message: '连接成功~',
//       description: '快往歌单里面添加歌曲吧!',
//     });
// });
// socket.on('disconnect', function(){
//   notification.open({
//       message: '退出连接了~',
//       description: '你自个听吧!',
//     });
// });

import './player.css';

const styles = {
  buttonControl: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px',
    color: 'white',
    fontSize: '28px',
    padding: '0 20px',
    marginBottom: '10px',
  },
  slideControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '10px 15px',
  },
  songPosition: {
    color: '#fff',
    width: '67px',
    textAlign: 'right',
  },
  button: {
    height: '40px',
    width: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  }
}

class Player extends Component{

  constructor(props){
    super(props);
    this.state = {
      volume: 0.5,
      url: null,
      songID: null,
      songLength: '--',
      songPosition: '--',
    };
    this.player = null;
    this.canNextSong = false;
    this.renderSong = this.renderSong.bind(this);
    this.next = this.next.bind(this);
    this.pause = this.pause.bind(this);
    this.getsongPosition = this.getsongPosition.bind(this);
    this.changeSongPosition = this.changeSongPosition.bind(this);
    this.changeSwitchType = this.changeSwitchType.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.changeSongList = this.changeSongList.bind(this);
  }

  componentWillMount(){
    if(localStorage.getItem('switchType') === 'random'){
      this.props.changeSwitchType('random');
    }
    if(localStorage.getItem('songIndex')){
      this.props.updateSongIndex(localStorage.getItem('songIndex'));
    }
  }

  componentWillReceiveProps(nextProps, nextState){
    let songs = nextProps.playlist[nextProps.playlistID].songs;
    if(!songs[nextProps.songIndex]){
      return
    }
    /**
     * once the next song id not equal current song id
     * delete the howler instance and render a new one
     */
    if(songs[nextProps.songIndex].id !== this.state.songID && nextProps.playStatus === 'play'){
      this.setState({songID: songs[nextProps.songIndex].id}, () => {
        localStorage.setItem('songIndex', nextProps.songIndex);
        this.renderSong(songs[nextProps.songIndex].vendor, songs[nextProps.songIndex].id, songs[nextProps.songIndex].album.id);
      });
    }
  }

  componentDidMount(){
    if(this.props.playStatus === 'play'){
      let songs = this.props.playlist[this.props.playlistID].songs;
      if(songs && songs.length > 0){
        console.log(this.props.songIndex);
        this.renderSong(songs[this.props.songIndex].vendor, songs[this.props.songIndex].id, songs[this.props.songIndex].album.id);
      }
    }
    const that = this;
    socket.on('play', function(msg){
      if(msg.playlist){
        that.changeSongList(msg.playlist);
      }
      if(msg.songIndex > -1){
        that.props.updateSongIndex(msg.songIndex);
      }
      if(msg.songPosition){
        console.log(msg.songPosition);
        // that.player.seek(msg.songPosition);
        // that.setState({
        //   songPosition: msg.songPosition
        // });
      }
      if(msg.switchType){
        const switchType = msg.switchType === 'list' ? 'random' : 'list';
        that.props.changeSwitchType(switchType);
      } 
    });
  }
  
  renderSong(vendor, id, albumid){
    /**
     *  first delete the player instance in exist
     */
    if(this.player){
      this.setState({
        songLength: '--',
        songPosition: '--',
      })
      // unload() 并没有停止当前，是个bug
      this.player.pause();
      // this.player.unload();
      // console.log(this.player)
      // console.log('清除当前');
      this.player = null;
    }

    if(this.t){
      clearInterval(this.t);
    }

    getSongURL(vendor, id, albumid)
      .then(url => {
        this.setState({url}, () => {
          this.player = new Howl({
            src: url,
            html5: true,
            onend: this.next,
          });
          if(this.props.playStatus === "play"){
            this.player.play();
          }
          this.player.once('play', () => {
            let length = this.player.duration();
            this.setState({
              songLength: length
            });
            this.t = setInterval(this.getsongPosition, 1000);
          });
        });
      })
      .catch(err => {
        notification.open({
          message: '出错啦',
          description: err,
        });
        this.next();
      });
  }

  next(){
    let list = this.props.playlist[this.props.playlistID].songs;
    if(this.props.switchType === 'list'){
      if(list.length === this.props.songIndex + 1){
        this.props.updateSongIndex(0);
      } else {
        this.props.updateSongIndex(this.props.songIndex + 1);
      };
    }
    if(this.props.switchType === 'random'){
      if(list.length === 1){
        this.props.updateSongIndex(0);
        return
      }
      let indexs = list.map((item, index) => {return index}).filter(i => i !== this.props.songIndex);
      let nextIndex = indexs[Math.floor(Math.random()*indexs.length)];
      this.props.updateSongIndex(nextIndex);
    }
    if(this.props.switchType === 'one'){
      if(list.length === this.props.songIndex + 1){
        this.props.updateSongIndex(0);
      } else {
        this.props.updateSongIndex(this.props.songIndex);
      };
    }
  }

  changeSwitchType(){
    const type = this.props.switchType === 'list' ? 'random' : 'list';
    // const type = this.props.switchType === 'list' ? 'one' : ('one' ? 'random' : 'list');
    this.props.changeSwitchType(type);
    if(localStorage){
      localStorage.setItem('switchType', type);
    }
    socket.emit('play',{
      switchType:this.props.switchType,
    });
  }

  pause(){
    const {playlist, playlistID} = this.props;
    if(playlist[playlistID].songs){
      if(playlist[playlistID].songs.length > 0){
        if(this.player){
          if(this.props.playStatus === 'pause'){
            this.player.play();
            this.props.updatePlayStatus('play');
          } else {
            this.player.pause();
            this.props.updatePlayStatus('pause');
          }
        } else {
          this.props.updatePlayStatus('play');
        }
      } else {
        notification.open({
          message: '歌单里面什么也没有哦~',
          description: '快往歌单里面添加歌曲吧!',
        });
      }
    }
    // 此时的状态还是前一个
    const that = this;
    if(this.props.playStatus === 'pause'){
      socket.emit('play',{
        playlist: that.props.playlist[0],
        songPosition: that.state.songPosition
      });
    }
    

  }

  formatTime(value){
    if(typeof(value) === 'string'){
      return value
    }
    let min = parseInt(value/60, 10);
    let sec = parseInt(value%60, 10);
    if(sec < 10){
      return `${min}:0${sec}`;
    } else {
      return `${min}:${sec}`;
    }
  }

  /**
   * once the user drag the slider,
   * clear the interval, set state of the drag value.
   */
  onChangeSongPosition(sec){
    if(this.t){
      clearInterval(this.t);
    }
    this.setState({
      songPosition: sec
    });
    // socket.emit('play',{
    //   songPosition: sec,
    // });
  }

  /**
   * once the user release drag of the slider
   */
  changeSongPosition(sec){
    if(this.player){
      this.player.seek(sec);
    }
    this.t = setInterval(this.getsongPosition, 1000);
  }

  getsongPosition(){
    this.setState({
      songPosition: this.player.seek()
    });
  }

  componentWillUnmount(){
    if(this.t){
      clearInterval(this.t);
    }
  }

  sendMessage(){
    this.props.sendMessage(true);
  }

  changeSongList(playlist){
    this.props.changeSongList(playlist);
    // 更新列表
  }

  render(){
    // var switchTypeOn = null;
    // const switchType = this.props.switchType;
    // switch(switchType){
    //   case 'one':
    //     switchTypeOn = `<i className="iconfont icon-loop1" />`;
    //     break;
    //   case 'random':
    //     switchTypeOn = `<i className="iconfont icon-loop-random" />`;
    //     break;
    //   default:
    //     switchTypeOn = `<i className="iconfont icon-loop" />`;
    // }

    return (
      <div className="audio-player">
        <div style={styles.slideControl}>
          <div style={{display: 'flex', flex: 1}}>
            <div style={{display: 'block', width: '100%', marginRight: '7px'}}>
              <Slider
                style={{width: '100%'}}
                defaultValue={0}
                max={typeof(this.state.songLength) === 'string' ? 1 : this.state.songLength}
                tipFormatter={(value) => this.formatTime(value)}
                onAfterChange={e => this.changeSongPosition(e)}
                value={typeof(this.state.songPosition) === 'string' ? 0 : this.state.songPosition}
                onChange={e => this.onChangeSongPosition(e)}
              />
            </div>
          </div>
          <div style={styles.songPosition}>
            {`${this.formatTime(this.state.songPosition)} / ${this.formatTime(this.state.songLength)}`}
          </div>
        </div>
        <div style={styles.buttonControl}>
          <div style={styles.button} title="歌词">
            <i className="iconfont icon-lyrics" />
          </div>
          <div style={styles.button} onClick={this.changeSwitchType} title={this.props.switchType === 'list' ? "列表循环" : "随机循环"}>
            { 
              this.props.switchType === 'list'
              ? <i className="iconfont icon-loop" />
              : <i className="iconfont icon-loop-random" />
            }
          </div>
          <div style={styles.button} onClick={this.pause} title={this.props.playStatus !== 'play' ? "播放" : "暂停"}>
            {
              this.props.playStatus !== 'play'
              ? <i className="iconfont icon-play" />
              : <i className="iconfont icon-pause" />
            }
          </div>
          <div style={styles.button} onClick={this.next} title="下一首">
            <i className="iconfont icon-next" />
          </div>
          <div style={styles.button} onClick={this.sendMessage} title="发弹幕">
            <i className="iconfont icon-wxin" />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    playlist: state.playlist,
    playlistID: state.playStatus.playlistID,
    songIndex: state.playStatus.index,
    playStatus: state.playStatus.status,
    switchType: state.playStatus.switchType,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updatePlayStatus: (status) => {
      dispatch({type: 'PLAY_STATUS_UPDATE_STATUS', status})
    },
    updateSongIndex: (index) => {
      dispatch({type: 'PLAY_STATUS_UPDATE_INDEX', index})
    },
    changeSwitchType: (type) => {
      dispatch({type: 'CHANGE_SWITCH_TYPE', switchType: type})
    },
    changeSongList: (status) => {
      dispatch({type: 'SYNC_NEW_LIST',playlistID: 0, name: status.name, songs: status.songs})
    },
    sendMessage: (status) => {
      dispatch({type: 'SEND_MESSAGE_STATUS', status})
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)
