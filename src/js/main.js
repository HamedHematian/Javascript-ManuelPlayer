/*  credit of whole design for Hamed Hematian Hemati
    github page : 
    you can simply plug this code in your project or website
    + full play controller
    + full volume controller
    + support diffrent qualitites for the video
    + support all keyboard events -> play, volume, subtitle, fullscreen
    + support full mouse events
    + manage buffer efficiently
    
    *full credit for svg buttons for FontAwsome -> https://fontawesome.com
    *full credit for subtitle flag svgs for -> http://flag-icon-css.lip.is
*/
//let config = require('./file1.js');
window.onload = () => {
    //declaring global variables

    //main sections
    let player_box = document.getElementById('player_box')
    let video_section = document.getElementById('video_section')
    let control_section = document.getElementById('controls_section')
    let body = document.querySelector('body')
    let curtimetext = document.getElementById('curtimetext')
    let durtimetext = document.getElementById('durtimetext')
    let timer = document.getElementById('timer')
    let timer_preview = document.getElementById('timer_preview')

    //getting items in HtmlDOM using ids
    let play_seekbar = document.getElementById('play_seekbar')
    let play_img = document.getElementById('P_play')
    let backward_img = document.getElementById('P_backward')
    let forward_img = document.getElementById('P_forward')
    let volume_img = document.getElementById('P_volume')
    let settings_img = document.getElementById('P_settings')
    let expand_compress_img = document.getElementById('P_expand_compress')

    //defining classes

    //PlayUIController handles playseekbar changes
    class PlayUIController {
        constructor() {
            this.width = video_section.width;
            this.duration = video_section.duration;
            this.boundingrect = video_section.getBoundingClientRect();
        }

        setSeekbarWatched(value) {
            let current = video_section.currentTime
            let buffered_list = video_section.buffered
            let after_watched = []
            let buffer_length = buffered_list.length
            for(let i = 0;i < buffer_length;i++) {
               if(buffered_list.end(i) > current) {
                   after_watched.push(
                    [(((buffered_list.start(i))*100)/video_section.duration) + '%',(((buffered_list.end(i))*100)/video_section.duration) + '%']
                    )
               }
            }
            let watched = `linear-gradient(to right, #FF0000 0, #FF0000 ${value}%, #978b8b ${value}%, #978b8b ${after_watched[0][1]})`
            play_seekbar.style.backgroundImage = watched;

        }
    }

    //Play class hanles play process
    class Play {
        constructor(timer,nowposition=0,playbackrate=1,state='pause') {
            this.isdragging = false;
            this.timer = timer;
            this.nowposition = nowposition;
            this.playbackrate = playbackrate;
            this.state = state;
            this.changeconstant = 10; //10s
            this.UIcontroller = new PlayUIController();
            this.width = video_section.width;
            this.duration = video_section.duration;
            this.boundingrect = video_section.getBoundingClientRect();
            this.draggedsick = false;
        }

        changeState() {
            if(this.state == 'pause') {
                this.state = 'play';
                video_section.play();
                play_img.src = 'img/pause.svg';
            } else {
                this.state = 'pause';
                video_section.pause();
                play_img.src = 'img/play.svg';
            }
        }

        displayCommercial(src) {
            video_section.src = src;
        }

        displaySource(src) {
            video_section.src = src;
        }

        clickPlaySeekbarHandler(offset) {
            video_section.currentTime = offset * this.duration;
        }

        backwardKeyHandler() {
            this.videoBackward();
        }

        forwardKeyHandler() {
            this.videoForward();
        }

        backwardClickHandler() {
            this.videoBackward();
        }

        forwardClickHandler() {
            this.videoForward();
        }

        playPauseClickHandler() {
            this.changeState();
        }

        videoBackward() {
            video_section.currentTime -= this.changeconstant;
        }

        videoForward() {
            video_section.currentTime += this.changeconstant;
        }

        spaceKeyHandler() {
            this.changeState();
        }

        updateTime() {
            if(!this.isdragging) {
                let watched = (video_section.currentTime/this.duration) * 100;
                this.UIcontroller.setSeekbarWatched(watched);
                this.updateTimer()  
            }
        }

        updateTimer(value=null) {
            if(value == null) {
                let curmins = Math.floor(video_section.currentTime / 60);
                let cursecs = Math.floor(video_section.currentTime - curmins * 60);
                let durmins = Math.floor(video_section.duration / 60);
                let dursecs = Math.floor(video_section.duration - durmins * 60);
                if(cursecs < 10){ cursecs = "0"+cursecs; }
                if(dursecs < 10){ dursecs = "0"+dursecs; }
                if(curmins < 10){ curmins = "0"+curmins; }
                if(durmins < 10){ durmins = "0"+durmins; }
                curtimetext.innerHTML = curmins+":"+cursecs;
                durtimetext.innerHTML = durmins+":"+dursecs;
            } else {
                let curmins = Math.floor(value / 60);
                let cursecs = Math.floor(value - curmins * 60);
                if(cursecs < 10){ cursecs = "0"+cursecs; }
                if(curmins < 10){ curmins = "0"+curmins; }
                return [curmins,cursecs]
            }
        }

        setCurrentTime(currenttime) {
            video_section.currentTime = currenttime;
        }

        showTimePreview(offsetx,clientwidth) {
            let offset = offsetx / clientwidth;
            let time = offset * this.duration;
            let minsec = this.updateTimer(time)
            timer_preview.style.display = 'block';
            timer_preview.style.left = offsetx - 40 + 'px';
           
            timer_preview.innerHTML = `${minsec[0]}:${minsec[1]}`
        }

        hideTimePreview() {
            timer_preview.style.display = 'none';
        }
    
    }

    //Important Class
    //Volume class handles volume settings
    class Volume {
        constructor(volume) {
            this.volume = .5;
            this.volumechangerate = .05;
            this.muted = false;
            this.laststate = this.volume;
            this.nowimg = 'img/volume-2.svg'
        }

        setVolume(volume) {
            video_section.volume = volume;
        }

        getVolume() {
            return video_section.volume;
        }

        setVolumeSeekbar() {

        }

        forwardKeyHandler() {
            if(this.volume >= .95 && this.volume <= 1) {
                this.setVolume(1);
                this.volume = 1;
            } else {
                this.volume += this.volumechangerate;
                this.setVolume(this.volume);
            }
            this.checkVolumeImg()
        }

        backwardKeyHandler() {
            if(this.volume >= 0 && this.volume <= .05) {
                this.setVolume(0);
                this.volume = 0;
            } else {
                this.volume -= this.volumechangerate;
                this.setVolume(this.volume);
            }
            this.checkVolumeImg()
        }

        dragVolumeSeekbar() {

        }

        checkVolumeImg() {
            if(this.volume == 0) {
                volume_img.src = 'img/volume-mute.svg'
            } else if(this.volume > 0  && this.volume <= .3333) {
                volume_img.src = 'img/volume-1.svg'
            } else if(this.volume > .3333  && this.volume <= .6666) {
                volume_img.src = 'img/volume-2.svg'
            } else if(this.volume > .6666  && this.volume <= 1) {
                volume_img.src = 'img/volume-3.svg'
            }
        }

        muteHandler() {
            if(this.muted) {
                this.volume = this.laststate;
                this.setVolume(this.volume);
                this.muted = false;
                volume_img.src = this.nowimg;
                
            } else {
                this.laststate = this.volume;
                this.setVolume(0);
                this.muted = true;
                volume_img.src = 'img/volume-mute.svg'
            }
        }
    }

    //VolumeUIController handles volumeseekbar changes
    class VolumeUIController {
        constructor() {

        }
    }

    class Fullscreen {
        constructor() {
            this.isfullscreen = false;
            this.previousattrs = {}
        }

        fullscreenCheck() {
            if(!this.isfullscreen) {
                this.fullScreenEnter()
            } else {
                this.fullScreenExit()
            }
        }

        fullScreenExit() {
            timer.style.fontSize = this.previousattrs.timerfontsize;
            video_section.style.width = this.previousattrs.videowidth;
            expand_compress_img.src = 'img/expand.svg'
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isfullscreen = false;
        }

        fullScreenEnter() {
            this.previousattrs = {
                timerfontsize : timer.style.fontSize,
                videowidth : video_section.style.width
            }
            expand_compress_img.src = 'img/compress.svg';
            timer.style.fontSize = '220%';
            video_section.style.width = '100%';
            // IE fullscreen
            if(player_box.requestFullScreen){
                player_box.requestFullScreen();
            //chrome fullscreen
            } else if(player_box.webkitRequestFullScreen){
                player_box.webkitRequestFullScreen();
            //mozilla fullscreen
            } else if(player_box.mozRequestFullScreen){
                player_box.mozRequestFullScreen();
            }
            this.isfullscreen = true;
        }

        secondaryExitHandler() {
            if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                this.isfullscreen = false;
                timer.style.fontSize = this.previousattrs.timerfontsize;
                video_section.style.width = this.previousattrs.videowidth;
                expand_compress_img.src = 'img/expand.svg'
            }            
        }

    }


    class Config {
        constructor() {
        
        }
    }


    class Settings {
        constructor() {
            this.hidden = true;
            this.settings_element = document.getElementById('settings_section');
        }

        toggleSettings() {
            if(this.hidden) {
                this.settings_element.style.display = 'flex'; 
                this.hidden = false;
            } else {
                this.settings_element.style.display = 'none';
                this.hidden = true;
            }
        }

    }

    class Quality {
        constructor(nowquality,dictofqualities) {

        }

        setQuality() {

        }

        fetchQuality() {

        }
    }

    class Advertise {

    }

    class KeyboardEventListener {
        static keyboardEventPatcher(e) {
            switch(e.keyCode) {
                case 37:
                    play_obj.backwardKeyHandler()
                    break
                case 39:
                    play_obj.forwardKeyHandler()
                    break
                case 38:
                    volume_obj.forwardKeyHandler()
                    break
                case 40:
                    volume_obj.backwardKeyHandler()
                    break
                case 70:
                    fullscreen_obj.fullscreenCheck()
                    break
                case 32:
                    play_obj.spaceKeyHandler()
                    break
            }
        }
    }

    

    let play_obj = new Play(0,0,1);
    let volume_obj = new Volume(50);
    let fullscreen_obj = new Fullscreen();
    let settings_obj = new Settings();

    //declaring EventListeners
    
    //declaring play eventListeners
    play_img.addEventListener('click',() => {
        play_obj.playPauseClickHandler()
    })
    body.addEventListener('keydown',KeyboardEventListener.keyboardEventPatcher)
    backward_img.addEventListener('click',() => {
        play_obj.backwardClickHandler();
    },false)
    forward_img.addEventListener('click',() => {
        play_obj.forwardClickHandler();
    },false)

    player_box.addEventListener('webkitfullscreenchange',(e) => {
        fullscreen_obj.secondaryExitHandler()
    },false)
    player_box.addEventListener('fullscreenchange',() => {
        fullscreen_obj.secondaryExitHandler()
    },false);   
    player_box.addEventListener('webkitfullscreenchange',() => {
        fullscreen_obj.secondaryExitHandler()
    },false);   
    player_box.addEventListener('mozfullscreenchange',() => {
        fullscreen_obj.secondaryExitHandler()
    },false);   
    player_box.addEventListener('MSFullscreenChange',() => {
        fullscreen_obj.secondaryExitHandler()
    },false);   

    play_seekbar.addEventListener('dragstart',(e) => {
        // hide preview dragged img
        let crt = e.target.cloneNode(true);
        crt.style.display = "none"; /* or visibility: hidden, or any of the above */
        document.body.appendChild(crt);
        e.dataTransfer.setDragImage(crt, 0, 0);
    },false);
    play_seekbar.addEventListener('drag',(e) => {
        play_obj.isdragging = true;
        let offset = (e.offsetX / e.target.clientWidth) * 100;
        play_obj.UIcontroller.setSeekbarWatched(offset);
        play_obj.showTimePreview(e.offsetX,e.target.clientWidth)
    },false);
    play_seekbar.addEventListener('dragend',(e) => {
        play_obj.isdragging = false;
        let offset_for_video = e.offsetX / e.target.clientWidth;
        let offset_for_play_seekbar = offset_for_video * 100;
        play_obj.UIcontroller.setSeekbarWatched(offset_for_play_seekbar); 
        play_obj.setCurrentTime(offset_for_video * play_obj.duration);
    },false);
    play_seekbar.addEventListener('mouseover',(e) => {
        play_obj.showTimePreview(e.offsetX,e.target.clientWidth);
    },false);
    play_seekbar.addEventListener('mousemove',(e) => {
        play_obj.showTimePreview(e.offsetX,e.target.clientWidth);
    },false);
    play_seekbar.addEventListener('mouseleave',(e) => {
        play_obj.hideTimePreview()
    },false);
    video_section.addEventListener('timeupdate',() => {
        play_obj.updateTime();
    })
    play_seekbar.addEventListener('click',(e) => {
        let offset = e.offsetX / e.target.clientWidth;
        play_obj.clickPlaySeekbarHandler(offset);
    },false);

    //declaring VCSF eventlisteners
    volume_img.addEventListener('click',(e) => {
        volume_obj.muteHandler();
    },false)
    //caption_img.addEventListener('click',captionImgClick,false)
    settings_img.addEventListener('click',(e) => {
        settings_obj.toggleSettings();
    },false)
    expand_compress_img.addEventListener('click',(e) => {
        fullscreen_obj.fullscreenCheck()
    })
    
}



