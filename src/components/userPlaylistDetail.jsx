import React from 'react'
import { connect } from 'react-redux';
import { Icon } from 'antd';
var wave = require('../../public/wave.gif');
var nowave = require('../../public/nowave.png');
import socketClient from './socketClient';
var socket = require('socket.io-client')(socketClient);
/* eslint-disable */
const styles = {
  row: {
    height: '40px',
    width: '290px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 15px',
    color: 'white',
  },
  button: {
    height: '40px',
    width: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    color: 'white',
    marginRight: '-10px',
  },
  right: {
    display: 'flex',
    flexDirection: 'row'
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  }
}

class PlaylistDetail extends React.Component {
  constructor(props){
    super(props);
    this.deleteSong = this.deleteSong.bind(this);
    this.changeSong = this.changeSong.bind(this);
  }

  deleteSong(listID, songID, index){
    if(songID === this.props.playlist[this.props.playlistID].songs[this.props.currentIndex].id){
      /**
       * if we are deleting what we are listened
       * we must dispatch change song
       */
      if(this.props.currentIndex === (this.props.playlist[this.props.playlistID].songs.length - 1)){
        // current listening is the last song
        this.props.changeSong(listID, 0);
      } else {
        this.props.changeSong(listID, this.props.currentIndex);
      }
    }
    if(this.props.currentIndex > index){
      /**
       * if we are deleting what before we are playing
       * we must change the play index
       */
       this.props.changeSong(listID, this.props.currentIndex-1);
    }
    this.props.deleteSong(listID, songID);

    const that = this;
    setTimeout(function(){
      socket.emit('play',{
          playlist: that.props.playlist[0]
        });
    },100);
  }

  changeSong(listID, songIndex){
    this.props.changeSong(listID, songIndex);
    if(this.props.playStatus !== 'play'){
      this.props.changePlayStatus('play');
    }
    const that = this;
    socket.emit('play',{
        // playlist: that.props.playlist[0],
        songIndex: songIndex
      });
  }

  render () {
    const { data, id, currentIndex, playStatus } = this.props;
    let list = [];
    data.map((item, index) => {
      let playing;
      if(currentIndex == index && playStatus === 'play'){
        playing = <img src={wave} style={{marginLeft: '10px', marginBottom: '2px'}} alt={'wave'} />;
      } else if (currentIndex == index){
        playing = <img src={nowave} style={{marginLeft: '10px', marginBottom: '2px'}} alt={'nowave'} />;
      } else {
        playing = null;
      }
      list.push(
        <div style={{...styles.row,
            borderTop: '1px solid rgba(200, 200, 200, 0.15)'
          }}
          key={index}
          data-id={index}
        >
          <div
            style={styles.left}
            onClick={() => this.changeSong(id, index)}
          >
            {`${index + 1}. ${item.name} - ${item.artists.map(i => i.name).join('&')}`}
            {playing}
          </div>
          <div style={styles.right}>
            <div style={styles.button} className="deleteSongButton" onClick={() => this.deleteSong(id, item.id, index)}>
              <Icon type="close" />
            </div>
          </div>
        </div>
      )
      return null;
    });
    return(
      <div style={styles.container}>
        {list}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    playlistID: state.playStatus.playlistID,
    playlist: state.playlist,
    currentIndex: state.playStatus.index,
    playStatus: state.playStatus.status,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteSong: (playlistID, songID) => {
      dispatch({type: 'DELETE_ONE_SONG', playlistID, songID});
    },
    changeSong: (playlistID, songIndex) => {
      dispatch({type: 'PLAY_STATUS_UPDATE_INDEX', index: songIndex});
      dispatch({type: 'PLAY_STATUS_UPDATE_PLAYLIST_ID', playlistID});
    },
    changePlayStatus: (status) => {
      dispatch({type: 'PLAY_STATUS_UPDATE_STATUS', status});
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistDetail);
