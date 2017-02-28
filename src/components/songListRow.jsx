import React, { Component } from 'react';
import { Icon, notification } from 'antd';
import { connect } from 'react-redux';
import { getSongURL } from '../redux/action/fetch';
import { browserHistory } from 'react-router';
import socketClient from './socketClient';
var socket = require('socket.io-client')(socketClient);

const styles = {
  row: {
    display: 'flex',
    width: '100%',
    height: '50px',
    alignItems: 'center',
  },
  name: {
    display: 'flex',
    flex: 12,
    paddingLeft: '15px',
    paddingRight: '10px',
    flexDirection: 'row',
    alignItems: 'center',
  },
  album: {
    display: 'flex',
    flex: 8,
  },
  artist: {
    display: 'flex',
    flex: 6,
  },
  action: {
    display: 'flex',
    cursor: 'pointer',
    flex: 3,
  },
  actionButton: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBadge: {
    display: 'inline',
    backgroundColor: 'LightCoral',
    color: '#fff',
    borderRadius: '3px',
    padding: '2px 6px',
    fontSize: '12px',
    marginLeft: '10px',
    minWidth: '60px',
  }
}
const name = {
  qq: 'QQ',
  netease: '网易',
  xiami: '虾米'
}

class SongListRow extends Component{
  constructor(props){
    super(props);
    this.state = {
      bgColor: this.props.index%2 === 0 ? '#fff' : '#fbfbfd'
    };
    this.addSong = this.addSong.bind(this);
    this.checkAddSong = this.checkAddSong.bind(this);
    this.downloadSong = this.downloadSong.bind(this);
  }

  pushToAlbumDetail(vendor, id){
    browserHistory.push(`/album/${vendor}/${id}`);
  }

  checkAddSong(vendor, data, needPay){
    const { playlist } = this.props;
    const songs = playlist['0'].songs;
    for(let i = 0; i < songs.length; i++){
      if(songs[i].vendor === vendor && songs[i].id === data.id){
        notification.warning({
          message: '出错啦~',
          description: '歌单里面已经有这首歌了哦!'
        });
        return;
      }
    }
    if(needPay && vendor==='netease'){
      notification.warning({
        message: '音乐咖还不支持网易付费歌曲哦~',
        description: '尝试其他搜索源试试？'
      });
      return;
    } else if (needPay){
      notification.warning({
        message: '您尝试添加了一首付费歌曲~',
        description: '音乐咖会尝试帮您加载!'
      });
    }
    this.addSong(vendor, data);
  }

  addSong(vendor, data){
    if(!data.artists && data.artist){
      data.artists = [...data.artist];
    }
    if(!data.album){
      data.album = {
        id: this.props.albumID,
        name: this.props.album,
        cover: this.props.albumCover
      }
    }
    this.props.addSong({...data, vendor});
    const that = this;
    setTimeout(function(){
      socket.emit('play',{
          playlist: that.props.playlist[0]
        });
    },100);
  }

  downloadSong(vendor, songID, albumID, songName, needPay){
    if(needPay && vendor === 'netease'){
      notification.warning({
        message: '音乐咖还不支持网易付费歌曲哦~',
        description: '尝试其他搜索源试试？'
      });
      return;
    }
    getSongURL(vendor, songID, albumID)
      .then(url => {
        console.log(url);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = songName;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        setTimeout(() => {
          downloadLink.click();
          setTimeout(() => {
            document.body.removeChild(downloadLink);
          }, 100);
        }, 100);
      })
      .catch(err => {
        notification.warning({
          message: '出错啦',
          description: err,
        });
      });
  }

  render(){
    return(
      <div style={{...styles.row, backgroundColor: this.state.bgColor}}>
        <div style={styles.name}>
          {`${this.props.index + 1}.  ${this.props.name || ''}`}
          {
            this.props.needPay && this.props.needPay !== false
            ? <div style={styles.payBadge}>{`${name[this.props.vendor]}付费`}</div>
            : null
          }
          {
            this.props.offline
            ? <div style={styles.payBadge}>{`${name[this.props.vendor]}已下线`}</div>
            : null
          }
        </div>
        <div style={styles.album}>
          {
            this.props.type === 'playlist'
            ? <div
                onClick={e => this.pushToAlbumDetail(this.props.vendor, this.props.albumID)}
                style={{cursor: 'pointer'}}
              >
                {this.props.album || ''}
              </div>
            : this.props.album || ''
          }
        </div>
        <div style={styles.artist}>
          {this.props.artist || ''}
        </div>
        {
          this.props.offline
          ? <div style={{...styles.action, cursor: 'default'}} />
          : <div style={styles.action}>
              <div
                style={styles.actionButton}
                onClick={e => this.downloadSong(this.props.vendor, this.props.id, this.props.albumID, this.props.name, this.props.needPay)}
              >
                <Icon type="arrow-down" />
              </div>
              <div
                style={styles.actionButton}
                onClick={e => this.checkAddSong(this.props.vendor, this.props.data, this.props.needPay)}
              >
                <Icon type="plus" />
              </div>
            </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    playlist: state.playlist,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addSong: (song) => {dispatch({type: 'INSERT_ONE_SONG', playlistID: 0, song: song})},
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SongListRow);
