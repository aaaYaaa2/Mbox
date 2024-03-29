let transformTime = require('./getplaytime.js');
let iconInfo = require('./svginfo.js');
let uiHtml = require('./buildui.js');
let getPosition = require('./getpositions.js');
let processLyric = require('./lyricprocessor.js');
let BuildPlayList = require('./buildplaylist.js');
let fakeSongPool = require('./songJSON.js');

class MBox {
	/**
	 *  MBox constructor function 
	 */
	 constructor(option) {
	 	
	 	// viewBox information 
	 	this.viewBox = iconInfo['viewBox'];
	 	
	 	// svg path information 
	 	this.svg = iconInfo['svg'];

	 	// the maximum number of songs in database, or it will be zero if nothing in the database
	 	this.maxIndex = 2; 

	 	/**
	 		> options: 
	 		1. element to load the Player
	 		2. foreground color
	 		3. background color 
	 		4. multi : multiple song or single song 
	 		5. music : music information (lyric is optional)

	 		// if the option is empty, then we could use defaultSetting 

	 		// need add api url here 
	 		4. song_ids: match the song_id in database that we would like to retrieve, this is an optional selection 
	 	*/
	 	this.noLyric = ['Lyric is not available'];
	 	const defaultSetting = {
	 		element : document.getElementsByClassName('plyr-container')[0],
	 		foreground_color : '#828a95',
	 		background_color : '#4a525a',
	 		multi : false,
	 		music : {
	 			'url' : 'music/You Need Me-KENN.mp3',
	 			'song_name' : 'You Need Me',
	 			'singer' : 'KENN',
	 			'album' : 'You Need Me',
	 			'album_cover' : 'music/YouNeedMeCover.jpg',
	 			'lyric_with_time' : false,
	 			'lyric' :  [
	 				'You Need Me - KENN',
	 				'',
	 				'君は　覚えているかい',
	 				'はじめて 出会えた時',
	 				'(Baby I need you)',
	 				'何故か　ふいに横切る',
	 				'おそれや　不安を確かめる',
	 				'',
	 				'上手く言葉じゃ君に',
	 				'伝えられないけれと',
	 				"(I'm missing you)",
	 				'誤解しないで　悲しまないで',
	 				'勇気出して　歩き出すよ',
	 				'So Feeling my heart',
	 				'',
	 				'君の名前を（呼んでいるよ)',
	 				'僕のメロディー　この歌に乗せて',
	 				'大好きだから（心つなぐ）',
	 				'この道をゆこう　永久に',
	 				'例えどんなに　苦しい時も',
	 				'もう　離れないから',
	 				'これからもずっと',
	 				'',
	 				'愛に 終わりはあるか',
	 				'はじめて 考えたよ',
	 				"(So Don't you fake me?)",
	 				'そうさ 失うことが',
	 				'怖くて 不安を抱きしめる',
	 				'',
	 				'君に　触れた瞬間（聞こえる)',
	 				'鼓動　揺らめいた瞳が',
	 				"(Don't be afraid)",
	 				'僕を見つめて　変わらぬまま',
	 				'2人で　愛を誓い合おう',
	 				'So just stay with me',
	 				'',
	 				'君への愛を（叫んでるよ）',
	 				'僕のメロディー　この声に乗せて',
	 				'大好きだから（溢れるほど）',
	 				'この道を行こう　永久に',
	 				'例えどんなに　苦しい時も',
	 				'もう　迷わないから',
	 				'これからもずっと',
	 				'',
	 				'I miss you　消えないで',
	 				'(Oh my sweet baby)',
	 				'僕が守るから',
	 				'',
	 				'そばにいるよ···',
	 				'',
	 				'君の名前を（呼んでいるよ）',
	 				'僕のメロディー　この歌に乗せて',
	 				'大好きだから（心つなぐ）',
	 				'この道をゆこう　永久に',
	 				'',
	 				'例えどんなに　苦しい時も',
	 				'もう　離さないから',
	 				'もう　迷わないから',
	 				'これからもずっと',
	 				'',
	 				"I don't wanna leave you"
	 			]
	 		}
	 	};

	 	// set the global options 
	 	this.usrOption = option || defaultSetting;

	 	// load the interface 
		this.usrOption['element'].innerHTML = uiHtml;

	 	// music piece realted properties
	 	this.musicFile = document.getElementsByClassName('mbox-music')[0];
	 	// this.processedLyric = processLyric(this.usrOption['music']['lyric_with_time'], this.usrOption['music']['lyric']);
	 	// music from database, add request later 
	 	this.musicPool = {};

	 	// generate music playlist 
	 	this.shufflePlaylist = [];
	 	this.heartPlaylist = [];
	 	this.currentPlaylist = [];
	 	this.curIdx = 0;
	 	// initialize the playlist 
	 	this.iniPlaylist = new BuildPlayList(this.currentPlaylist, this.musicPool);

	 	// bar length 
	 	this.volumeBarLen = 50;
	 	this.progressBarLen = 225;

	 	// body part flag 
	 	this.LyricOn = true;

	 	// lyric block line height for scroll dynamic music use 
	 	this.lyricLineHeight = 0;
	 	/*
			player related elements 
	 	*/
	 	// icons 
	 	this.playBtn = document.getElementsByClassName('mbox-play-icon')[0];
	 	this.volumeBtn = document.getElementsByClassName('mbox-volume-icon')[0];
	 	// album related information 
	 	this.coverArea = document.getElementsByClassName('mbox-album-cover-wrap')[0];
	 	this.songInfo = document.getElementsByClassName('mbox-song-info')[0];
	 	this.albumName = document.getElementsByClassName('mbox-album-name')[0];
	 	// volume realted 
	 	this.volumeIcon = document.getElementsByClassName('mbox-volume-icon')[0];
	 	this.volumeBar = document.getElementsByClassName('mbox-volume-bar-inner')[0];
	 	this.volumeBarOutter = document.getElementsByClassName('mbox-volume-bar')[0];
	 	// play progress related
	 	this.playProgressBar = document.getElementsByClassName('mbox-play-progress-inner')[0];
	 	this.playProgressOuter = document.getElementsByClassName('mbox-play-progress-wrap')[0];
	 	// play time related
	 	this.playedTime = document.getElementsByClassName('mbox-time-played')[0];
	 	this.totalTime = document.getElementsByClassName('mbox-time-total')[0];
	 	// display area
	 	this.displayArea = document.getElementsByClassName('mbox-multidisplay-area')[0];
	 	this.displayAreaWrap = document.getElementsByClassName('mbox-multidisplay-area-wrap')[0];

	 	// play next and play previous icon 
	 	this.playNext = document.getElementsByClassName('mbox-next-song-icon')[0];
	 	this.playPre = document.getElementsByClassName('mbox-previous-song-icon')[0];
	 	
		// song row menu
		this.showLyric = document.getElementsByClassName('mbox-lyricBtn')[0];
		this.showHeartList = document.getElementsByClassName('mbox-lovelistBtn')[0];
		this.shwoPlaylist = document.getElementsByClassName('mbox-playlistBtn')[0];
	 	
	 	// insert lyric or play list 
	 	/*
			@param {Object} progress bar needs to be update 
			@param {Number} percentage that needs to be update 
			@param {String} the property that needs to be updated on  
		*/

		this.updateProgressBar = (barname, percentage, prop) => {
			// test if the percentage is between 0 and 1 
			percentage = percentage<0? 0 : percentage;
			percentage = percentage>1? 1 : percentage;
		
			this['' + barname + 'Bar'].style[prop] = '' + percentage*100 + '%';
		}

		/*
			method for build needed svg html block
			@param [String] svg viewBox
			@param [String] svg path dimension 
		*/

		this.getSvg = (viewBox, svgPath) => {
			let svgHead = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="${viewBox}">`,
				svgTail = `</svg>`,
				pathTemplate = `<path d="${svgPath}">`;
			return svgHead  + pathTemplate + svgTail;
		};

	 	/*
			method for detect the playing status 
	 	*/
	 	let musicCurrentTime = 0,
	 		musicLastTime = 0,
	 		musicTotalTime = 0,
	 		buffering = false;

	 	this.detectPlayStatus = () => {
	 		// if the audio is not buffering, paused or ended then we check the status
	 		if(!buffering){
	 			this.detectIdx = setInterval(()=>{
	 				musicCurrentTime = Math.floor(this.musicFile.currentTime);
	 				musicTotalTime = Math.floor(this.musicFile.duration);
	 				let currentTimeKey = '' + transformTime(musicCurrentTime);
	 				this.playedTime.innerHTML = currentTimeKey;
	 				this.totalTime.innerHTML = '' + transformTime(musicTotalTime);
	 				// dealing with moving lyric, if we have a song with moving lyrics 
	 				if(this.LyricOn && this.musicPool['_' + this.currentPlaylist[this.curIdx]].lyric_with_time){
	 					let theLyr = document.getElementsByClassName('mbox-multidisplay-area')[0];
	 					if(this.musicPool['_' + this.currentPlaylist[this.curIdx]].lyricTime[currentTimeKey]){
	 						theLyr.scrollTop+=16;
	 						this.musicPool['_' + this.currentPlaylist[this.curIdx]].lyricTime[currentTimeKey] = false;
	 						let curLyricLine = document.getElementById(currentTimeKey);
	 						curLyricLine.style.color = '#dff3e3';
	 					}
	 				}
	 					let playPercent = musicCurrentTime/musicTotalTime;
	 					this.updateProgressBar('playProgress', playPercent, 'width');
	 					if(!buffering && (musicCurrentTime-musicLastTime)<0.2 && !this.musicFile.paused && !this.musicFile.ended){
	 						buffering = true;
	 					}
	 					if(buffering && (musicCurrentTime-musicLastTime)>=0.2) buffering = false;
	 					musicLastTime = musicCurrentTime;
	 					if(this.musicFile.ended){
	 						this.playBtn.innerHTML = this.getSvg(this.viewBox['play'], this.svg['play']);
	 						let ct=this.curIdx;
	 						// set back lyric time to true 
	 						let endedSong = this.musicPool['_' + this.currentPlaylist[this.curIdx]];
	 						if(endedSong.lyric_with_time){
	 							for(let key in endedSong.lyricTime) endedSong.lyricTime[key] = true;
	 						}
	 						for(ct=this.curIdx+1; ct<this.currentPlaylist.length; ct++){
	 							let curKey = '_' + this.currentPlaylist[ct];
	 							if(!this.musicPool[curKey].removed && !this.musicPool[curKey].deleted){
	 								// if the song is not removed or deleted by user, we find the next song to play 
	 								this.musicFile.src = this.musicPool[curKey].url;
	 								this.loadSongInfo(this.musicPool[curKey], this.LyricOn);
	 								// update current playing index 
	 								this.curIdx = ct;
	 								this.play();
	 								break;
	 							}
	 						}
	 						// if there is no more song to play, stop the player 
	 						if(ct===this.currentPlaylist.length) {
	 							this.clearTime();
	 							this.pause();
	 						}
	 					}
	 			},200);
	 		}
	 	};

	 	/*
			method dealing with toggle play button 
	 	*/
	 	this.togglePlay = () => {
	 		if(this.musicFile.paused){
	 			this.playBtn.innerHTML = this.getSvg(this.viewBox['pause'], this.svg['pause']);
	 			this.play();
	 		}else{
	 			this.playBtn.innerHTML = this.getSvg(this.viewBox['play'], this.svg['play']);
	 			this.pause();
	 		}
	 	}

	 	// add eventListener to play/pause button 
	 	this.playBtn.addEventListener('click',() => {
	 		this.togglePlay();
	 	});

	 	/*
			method for dealing with volume change
	 	*/
	 	this.watchVolume = () => {
	 		// get the volume between 0.0 to 1.0
	 		let curVolume = this.musicFile.volume;
	 		this.updateProgressBar('volume', curVolume, 'width');
	 		if(curVolume === 0.0) {
	 			this.volumeIcon.innerHTML = this.getSvg(this.viewBox['mute'], this.svg['mute']);
	 		}else if(curVolume > 0 && curVolume<0.6) {
	 			this.volumeIcon.innerHTML = this.getSvg(this.viewBox['volume'], this.svg['volume']);
	 		}else{
	 			this.volumeIcon.innerHTML = this.getSvg(this.viewBox['high_volume'], this.svg['high_volume']);
	 		}
	 	}
	 	/*
			method for clearInterval 
	 	*/
	 	this.clearTime = () => {
	 		clearInterval(this.detectIdx);
	 	}

	 	/*
			compute the lyric line height
	 	*/
	 	this.getLyricLineHeight = () => {
	 		if(this.LyricOn){
	 			let lyricArea = document.getElementsByClassName('mbox-multidisplay-area')[0];
	 			let cssLineHeight = pareseInt(getStyle(lyricArea, 'line-height'), 10);
	 			let clone = undefined;
	 			let computedLineHeigh = undefined;
	 			if(isNaN(cssLineHeight)){
	 				clone = element.cloneNode();
	 				clone.innerHTML = '<br><br>';
	 				element.appendChild(clone);
	 				let twoline = clone.offsetHeight;
	 				clone.innerHTML = '<br><br><br><br>';
	 				let fourline = clone.offsetHeigh;
	 				element.removeChild(clone);
	 				computedLineHeigh = fourline - twoline;
	 			} 
	 			return computedLineHeigh;
	 		}
	 		return 0;
	 	}

	 	/*
			add listener to play next button
	 	*/

	 	this.playNext.addEventListener('click', ()=>{
	 			let i=0;
	 			for(i=this.curIdx+1; i<this.currentPlaylist.length; i++){
	 				let nextSongToPlay = this.musicPool['_'+this.currentPlaylist[i]];
	 				if(nextSongToPlay!==undefined && !nextSongToPlay.removed && !nextSongToPlay.deleted){
	 					this.musicFile.src = nextSongToPlay.url;
	 					this.loadSongInfo(nextSongToPlay, this.LyricOn);
	 					this.play();
	 					this.curIdx = i;
	 					break;
	 				}
	 			}
	 			if(i===this.currentPlaylist.length) alert('no more song to play');
	 	});

	 	/*
			add listener to play previous button
	 	*/

	 	this.playPre.addEventListener('click', ()=>{
	 		let i=0; 
	 		for(i=this.curIdx-1; i>=0; i--){
	 			let previousSong = this.musicPool['_' + this.currentPlaylist[i]];
	 			if(previousSong!==undefined && !previousSong.removed && !previousSong.deleted){
	 				this.musicFile.src = previousSong.url;
	 				this.loadSongInfo(previousSong, this.LyricOn);
	 				this.play();
	 				this.curIdx = i;
	 				break;
	 			}
	 		}
	 		if(i===-1) alert('This is the first song already');
	 	});

	 	/*
			add listener to volume bar 
	 	*/
	 	this.volumeBarOutter.addEventListener('click',(event) => {
	 		let clickX = event.clientX,
	 			barX = getPosition(this.volumeBarOutter, 'left'),
	 			percentage = (clickX - barX)/this.volumeBarLen;
	 		this.musicFile.volume = percentage>1? 1 : (percentage<0? 0 : percentage);
	 		this.watchVolume();
	 		this.updateProgressBar('volume', percentage, 'width');
	 	});

	 	/*
			add listener to progress bar 
	 	*/
	 	this.playProgressOuter.addEventListener('click', (event) => {
	 		let clickX = event.clientX,
	 			barX = getPosition(this.playProgressOuter, 'left'),
	 			percentage = (clickX - barX)/this.progressBarLen,
	 			previousTime = transformTime(this.musicFile.currentTime),
	 			preserveTime = transformTime((percentage>1? 1 : (percentage<0? 0 : percentage))*this.musicFile.duration);
	 		this.musicFile.currentTime = (percentage>1? 1 : (percentage<0? 0 : percentage))*this.musicFile.duration;
	 		// dealing with lyric problem 
	 		let curSong = this.musicPool['_' + this.currentPlaylist[this.curIdx]];
	 		if(this.LyricOn && curSong.lyric_with_time){
	 			// if the song has timed lyrics
	 			let timePool = curSong.lyricTime, lineCt = 0;
	 			let theLyr = document.getElementsByClassName('mbox-multidisplay-area')[0];
	 			let lyrics = theLyr.children[1].children;
	 			if(previousTime<preserveTime){
	 				for(let i=0; i<lyrics.length; i++){	
	 					if(lyrics[i].id!=="" && lyrics[i].id<preserveTime && lyrics[i].id>previousTime){
	 						lyrics[i].style.color = '#dff3e3';
	 						theLyr.scrollTop+=16;
	 					}
	 				}
	 			}else{
	 				for(let i=0; i<lyrics.length; i++){	
	 					if(lyrics[i].id!=="" && lyrics[i].id>preserveTime && lyrics[i].id<previousTime){
	 						lyrics[i].style.color = '#828a95';
	 						theLyr.scrollTop-=16;
	 					}
	 				}
	 			}
	 		}
	 		this.updateProgressBar('playProgress', percentage, 'width');
	 	});

	 	/*
			add listener to volume icon, when click volume icon, turn the music to mute 
	 	*/
	 	this.volumeBtn.addEventListener('click', () => {
	 		this.volumeBtn.innerHTML = this.getSvg(this.viewBox['mute'], this.svg['mute']);
	 		this.musicFile.volume = 0;
	 		this.updateProgressBar('volume', 0, 'width');
	 	});

	 	this.shwoPlaylist.addEventListener('click', () => {
	 		if(this.LyricOn) this.LyricOn = false;
	 		this.displayAreaWrap.innerHTML = this.iniPlaylist.initPlaylist();
	 		for(let key in this.musicPool){
	 			if(!this.musicPool[key].removed && !this.musicPool[key].deleted){
	 				let rowUI = this.iniPlaylist.addSongRow(this.musicPool[key], this.musicPool[key].like);
					//console.log(rowUI);
	 				let fakeEle = document.createElement('li');
	 				fakeEle.innerHTML = rowUI;
	 				let rowEle = fakeEle.children[0];
	 				let node = document.getElementsByClassName('mbox-multidisplay-playlist-ul')[0];
	 				node.appendChild(rowEle);
	 			}
	 		}
	 		// define method for row buttons
	 		this.rowHeartIcons = document.getElementsByClassName('mbox-row-heart');
	 		this.rowDeleteIcons = document.getElementsByClassName('mbox-row-garbage');
	 		this.rowRemoveIcons = document.getElementsByClassName('mbox-row-remove');

	 		// function handling click event for heart symbol 
	 		let clickBind = (songId, i)=>{
	 			return () => {
	 				this.likeSong(songId);
	 				this.rowHeartIcons[i].children[0].style['fill'] = this.musicPool['_'+songId].like? '#f0717d' : '#828a95';
	 			}
	 		};

	 		// function handling click event for remove symbol
	 		let clickRemoveBind = (songId) => {
	 			return () => {
	 				this.removeSong(songId);
	 			}
	 		};

	 		// function handling click event for delete symbol 
	 		let clickDeleteBind = (songId) => {
	 			return () => {
	 				this.deleteSong(songId);
	 			}
	 		}


	 		// add listener to the icon
	 		for(let i=0; i<this.rowHeartIcons.length; i++){
	 			// console.log(this.rowHeartIcons[i].parentElement.parentElement);
	 			let curID = this.rowHeartIcons[i].parentElement.parentElement.id;
	 			this.rowHeartIcons[i].addEventListener('click', clickBind(curID, i));
	 			this.rowRemoveIcons[i].addEventListener('click', clickRemoveBind(curID));
	 			this.rowDeleteIcons[i].addEventListener('click', clickDeleteBind(curID));

	 		}
	 	});

	 	this.showLyric.addEventListener('click', () => {
	 		if(!this.LyricOn) this.LyricOn = true;
	 		let currentSong = this.musicPool['_' + this.currentPlaylist[this.curIdx]];
			this.displayAreaWrap.innerHTML = '<div class="mbox-multidisplay-area"><div class="mbox-lyric-prefix"></div><div>' + currentSong.lyric + '</div><div class="mbox-lyric-prefix"></div></div>';

	 		let curSong = this.musicPool['_' + this.currentPlaylist[this.curIdx]];
	 		let jumpToTime = transformTime(this.musicFile.currentTime);
	 		// if the lyric window is on and the lyric is a lyric file with time 
	 		if(curSong.lyric_with_time){
	 			// if the song has timed lyrics
	 			let timePool = curSong.lyricTime, lineCt = 0;
	 			let theLyr = document.getElementsByClassName('mbox-multidisplay-area')[0];
	 			let lyrics = theLyr.children[1].children;
	 			for(let i=0; i<lyrics.length; i++){	
	 				if(lyrics[i].id!=="" && lyrics[i].id<jumpToTime){
	 					lyrics[i].style.color = '#dff3e3';
	 					theLyr.scrollTop+=16;
	 				}
	 			}
	 		}
	 	});

	 	this.showHeartList.addEventListener('click', ()=>{
	 		if(this.LyricOn) this.LyricOn = false;
	 		this.displayAreaWrap.innerHTML = this.iniPlaylist.initPlaylist();
	 		for(let i=0; i<this.currentPlaylist.length; i++){
	 			let currentSong = this.musicPool['_'+this.currentPlaylist[i]];
	 			if(currentSong.like && !currentSong.removed && !currentSong.deleted){
	 				// double check for validation 
	 				let rowUI = this.iniPlaylist.addSongRow(currentSong, true);
	 				let fakeEle = document.createElement('li');
	 				fakeEle.innerHTML = rowUI;
	 				let rowEle = fakeEle.children[0];
	 				let node = document.getElementsByClassName('mbox-multidisplay-playlist-ul')[0];
	 				node.appendChild(rowEle);
	 			}
	 		}

	 		// define method for row buttons
	 		this.rowHeartIcons = document.getElementsByClassName('mbox-row-heart');
	 		this.rowDeleteIcons = document.getElementsByClassName('mbox-row-garbage');
	 		this.rowRemoveIcons = document.getElementsByClassName('mbox-row-delete');

	 		// function handling click event
	 		let clickBind = (songId, i)=>{
	 			return () => {
	 				this.likeSong(songId);
	 				let rowEle = document.getElementById('' + songId);
	 				rowEle.remove();
	 			}
	 		};

	 		// add listners to the icon
	 		for(let i=0; i<this.rowHeartIcons.length; i++){
	 			let curID = this.rowHeartIcons[i].parentElement.parentElement.id;
	 			this.rowHeartIcons[i].addEventListener('click', clickBind(curID, i));

	 		}
	 	});
	}
	
	/*
		method for initialize the music player 
	*/
	init(){
	 			this.musicPool = fakeSongPool;
	 			for(let key in this.musicPool){
	 				let currentSong = this.musicPool[key];
					this.currentPlaylist.push(Number(key.substring(1)));
					if(currentSong.like) this.heartPlaylist.push(Number(key.substring(1)));
					// process the lyric once they enter the API 
					let returnedLyric = processLyric(currentSong['lyric_with_time'], currentSong['lyric']);
					currentSong.lyric = returnedLyric.processedText;
					currentSong.lyricTime = returnedLyric.lyricObj;
				}
				this.musicFile.src = this.musicPool['_' + this.currentPlaylist[0]]['url'];
				this.loadSongInfo(this.musicPool['_' + this.currentPlaylist[0]], true);
	}

	/*
		method for loading the UI components for player 
	*/
	loadSongInfo(song, lyricOn) {
		// load the album cover 
		this.coverArea.innerHTML = `<img src="${song['album_cover']}" width="70px" height="70px">`;
		this.songInfo.innerText = '' + song['song_name'] + ' - ' + song['singer'];
		this.albumName.innerText = '' + song['album']; 
		if(lyricOn){
			if(this.usrOption['music']['lyric']===undefined){
				this.usrOption['music']['lyric'] = this.noLyric;
			}else{
				this.displayAreaWrap.innerHTML = '<div class="mbox-multidisplay-area"><div class="mbox-lyric-prefix"></div><div>' + song.lyric + '</div><div class="mbox-lyric-prefix"></div></div>';
	 		}
	 	}
	}

	/*
		method for add a new song to the database 
		@param {Object} object contains new song's information, has the same foramt as the initial input  
		@return {boolean} notify if the song is added succefully or not 
	*/

	addSong(newSong) {
		// process new id
		// find the largest id
		let maxId = 0;
		for(let key in this.musicPool){
			maxId = Math.max(maxId, this.musicPool[key]._id);
		}
	 	// add the song to current playlist
	 	let newId = '_' + (maxId+1); 
	 	this.musicPool[newId] = newSong;
	 	newSong._id = maxId + 1;
	 	newSong.removed = false;
		newSong.deleted = false;
		let returnedLyric = processLyric(newSong['lyric_with_time'], newSong['lyric']);
		newSong.lyric = returnedLyric.processedText;
		newSong.lyticTime = returnedLyric.lyricObj;
		newsong.like = false;
		this.musicPool[newId] = newSong;
		this.currentPlaylist.push(maxId+1);
	}

	/*
		method for remove a song from current playlist 
	*/

	removeSong(songID) {
		let originID = songID;
		this.musicPool['_' + originID].removed = true;
		this.iniPlaylist.removeSongRow(songID);
	}

	/*
		method for deleting the song 
	*/
	deleteSong(songID) {
		let originID = songID;
		this.musicPool['_'+originID].deleted = true;
		// deleted song from database, or add gargbage place later 
		// remove the song row 
		this.iniPlaylist.removeSongRow(songID);
	}

	/*
		method for like a song 
	*/
	likeSong(songID) {
		if(this.musicPool['_' + songID].like) {
			this.musicPool['_'+songID].like = false;
		}else{
			this.musicPool['_'+songID].like = true;
		}
	}

	/*
		method for playing music 
	*/
	play() {
		if(this.musicFile.paused){
			this.musicFile.play();
			this.watchVolume();
			this.detectPlayStatus();
			this.playBtn.innerHTML = this.getSvg(this.viewBox['pause'], this.svg['pause']);
		}
	}

	/*
		method for pause music 
	*/
	pause() {
		if(!this.musicFile.paused && !this.musicFile.ended){
			this.musicFile.pause();
			this.playBtn.innerHTML = this.getSvg(this.viewBox['play'], this.svg['play']);
		}
	}
}

if(typeof window === 'undefined') {
	module.exports = MBox;
}else{
	window.MBox = MBox;
}
