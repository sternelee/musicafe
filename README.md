> 修改

基于`musicafe`的修改，完成以下功能

- 与朋友实时共听
- 用户登陆
- 分享用户ID实现共听


### 代码更改

#### 模块问题

- 删除`react-icons`模块，只用`antd`
- `howler`的`unload()`无效

#### 播放问题

- `howler`的unload()有问题，并没有停止和删除当前对象,
为了缓存播放历史，应把对象放在数组中，进行控制，以免不并要的音频文件加载
- 为达到同时倾听，应监听歌曲加载是否完成，与同时播放（可以只监听主方的播放位置，从方加载完直接到相同的播放位置，从方可选）
- 应该保存歌曲`ID`


#### 功能添加
- 添加歌词显示，与播放列表切换
- 可以不设置用户，使用唯一ID进行交流
- 聊天弹幕
- 只需要监听的事件有以下
  - 歌曲添加
  - 列表更新
  - 只有播放时共听
  - 歌曲进度条
  - 循环状态





# musicafe 音乐咖

> For most Chinese people, we are using netease, xiami, or QQ music service everyday for enjoying music, but
 we are also bothered with changing the platform each time for the songs or artists we love. Musicafe is a web
 music platform for simply it.

<p align="center"><img width=80% src="/public/capture.jpg"></p>

# Functions
* Search netease, xiami, qq songs, albums, playlists.
* Get albums, playlists details.
* Add songs to your list and play.
* (Unsuggested) Add VIP songs(neet pay) of xiami, qq, example [here](https://musicafe.co/album/xiami/2102661271).
* (Unsuggested) Add unauthorized songs of xiami, qq, example [here](https://musicafe.co/album/qq/0033AjP71h7iIR).
* Download songs in albums and playlists page.

# Run local

```shell
git clone https://github.com/LIU9293/musicafe.git
cd musicafe
npm install
npm run https (not npm start!!!)
```
Because the API server is using https, so http development environment may cause CORS issue. 
**PLEASE DO delete the baidu analytic code in public/index.html as well !!!**

**Use your own API server**
```shell
src/redux/action/fetch.js
const base = 'localhost:8080/api/';

npm run build
node server/index.js
npm start
```
If there are any CORS problem, go to server/index.js and change res.header("Access-Control-Allow-Origin", "*");

# Useful stuff used
* [music-api](https://github.com/LIU9293/musicAPI), centralized Node.JS API SDK for xiami, netease, and qq music.
* [Howler.js](https://github.com/goldfire/howler.js), Javascript audio library for the modern web.
* [create-react-app](https://github.com/facebookincubator/create-react-app)
* [Ant design](ant.design)

# HTTPS
The website is using https, but all media files in netease, xiami and qq are transferred via http, so the https badge 
will grey out after you listen to something. T.T

# TODOS
- [ ] Pray for not be forbidded...
- [ ] Mutilple user playlists, listen whole album or playlist directly.
- [ ] Account to remeber playlists.
- [ ] Go mobile.