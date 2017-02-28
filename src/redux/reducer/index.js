import { combineReducers } from 'redux';
import { searchKey, searchResult } from './search';

const initPlaylist = {
  0: {
    name: '我的歌单',
    songs: []
  }
}

const playlist = (state = initPlaylist, action) => {
  switch (action.type) {
    case 'CREATE_NEW_LIST':
      return {
        ...state,
        [action.playlistID]: {
          name: action.name,
          songs: action.songs || []
        }
      };
    case 'SYNC_NEW_LIST':
      return {
        ...state,
        [action.playlistID]: {
          name: action.name,
          songs: action.songs || []
        }
      };
    case 'DELETE_ONE_LIST':
      let newState = {...state};
      delete newState[action.playlistID];
      return newState;
    case 'INSERT_ONE_SONG':
      return {
        ...state,
        [action.playlistID]: {
          name: state[action.playlistID].name,
          songs: state[action.playlistID].songs.concat([action.song]),
        }
      };
    case 'DELETE_ONE_SONG':
      return {
        ...state,
        [action.playlistID]: {
          name: state[action.playlistID].name,
          songs: state[action.playlistID].songs.filter(x => x.id !== action.songID)
        }
      };
    case 'UPDATE_PLAYLIST':
      return {
        ...state,
        ...action.playlist
      }
    default:
      return state;
  }
}

const playStatus = (state = {index: 0, playlistID: 0, status: 'stop',sendVisible:false, switchType: 'list'}, action) => {
  switch (action.type) {
    case 'PLAY_STATUS_UPDATE_INDEX':
      console.log('will update song index', action.index);
      return {
        ...state,
        index: action.index,
      }
    case 'PLAY_STATUS_UPDATE_STATUS':
      return {
        ...state,
        status: action.status,
      }
    case 'SEND_MESSAGE_STATUS':
      return {
        ...state,
        sendVisible: action.status,
      }
    case 'PLAY_STATUS_UPDATE_PLAYLIST_ID':
      return {
        ...state,
        playlistID: action.playlistID
      }
    case 'CHANGE_SWITCH_TYPE':
      return {
        ...state,
        switchType: action.switchType
      }
    default:
      return state;
  }
}

const dataTransInitState = {
  discover: null,
  playlist: {}
}

const dataTrans = (state = dataTransInitState, action) => {
  switch (action.type) {
    case 'DATA_TRANS_PLAYLIST':
      return {
        ...state,
        playlist: {
          title: action.title,
          cover: action.cover,
          id: action.id,
          author: action.author,
        }
      }
    case 'DATA_TRANS_DISCOVER':
      return{
        ...state,
        discover: action.discoverData,
      }
    default:
      return state;
  }
}

export default combineReducers({
  playlist,
  playStatus,
  searchKey,
  searchResult,
  dataTrans,
})
