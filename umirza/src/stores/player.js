import { defineStore } from "pinia";

let player = null;
let timer = null;

export const usePlayerStore = defineStore('player', {
    state: () => ({
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 50,
        isReplay: false,
        allTracks: [],
        history: []
    }),

    actions: {
        setTracks(tracks) { 
            this.allTracks = tracks; 
        },

        async setTrack(track, isBack = false) {
            if (!isBack && this.currentTrack) {
                this.history.push(this.currentTrack);
            }

            this.currentTrack = track;
            this.currentTime = 0;
            
            if (track.videoId) {
                this.playVideo(track.videoId);
            } else {
                const searchTerm = `${track.artist} ${track.name}`;
                try {
                    const res = await fetch(`http://localhost:3000/play?q=${encodeURIComponent(searchTerm)}`);
                    const data = await res.json();
                    if (data.id) this.playVideo(data.id);
                } catch (err) { console.error("Hata:", err); }
            }
        },

        playVideo(videoId) {
            // Player varsa ve yükleme fonksiyonu hazırsa direkt çalıştır
            if (player && typeof player.loadVideoById === 'function') {
                try {
                    player.loadVideoById(videoId);
                    this.isPlaying = true;
                } catch (e) {
                    // Eğer player sapıttıysa yeniden kur
                    this.initYoutubePlayer(videoId);
                }
            } else {
                this.initYoutubePlayer(videoId);
            }
        },

        initYoutubePlayer(videoId) {
            // Eski iframe'i temizle (Çakışmaları önler)
            const playerDiv = document.getElementById('youtube-player');
            if (playerDiv) playerDiv.innerHTML = '';

            const onPlayerReady = () => {
                player = new window.YT.Player('youtube-player', {
                    height: '0', width: '0', videoId: videoId,
                    playerVars: { 
                        'autoplay': 1, 
                        'controls': 0, 
                        'origin': window.location.origin,
                        'enablejsapi': 1 
                    },
                    events: {
                        'onReady': (e) => {
                            e.target.setVolume(this.volume);
                            e.target.playVideo();
                            this.startTimer();
                        },
                        'onStateChange': (e) => {
                            this.isPlaying = (e.data === 1);
                            if (e.data === 1) this.duration = player.getDuration();
                            if (e.data === 0) this.playNextTrack();
                        },
                        'onError': (e) => {
                            console.error("YouTube Hatası:", e.data);
                            this.playNextTrack(); // Video bozuksa sonrakine geç
                        }
                    }
                });
            };

            if (window.YT && window.YT.Player) {
                onPlayerReady();
            } else {
                // Script yüklü değilse yükle
                if (!document.querySelector('script[src*="iframe_api"]')) {
                    const tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    document.head.appendChild(tag);
                }
                window.onYouTubeIframeAPIReady = onPlayerReady;
            }
        },

        // --- BUTON FONKSİYONLARI ---
        playPreviousTrack() {
            if (this.history.length > 0) {
                const lastTrack = this.history.pop();
                this.setTrack(lastTrack, true);
            } else { this.seekTo(0); }
        },

        playNextTrack() {
            if (this.allTracks.length > 0 && this.currentTrack) {
                const currentIndex = this.allTracks.findIndex(t => t.videoId === this.currentTrack.videoId);
                let nextIndex = (currentIndex !== -1 && currentIndex < this.allTracks.length - 1) ? currentIndex + 1 : 0;
                this.setTrack(this.allTracks[nextIndex]);
            } else { this.playRandomTrack(); }
        },

        toggleReplay() {
            if (player && typeof player.seekTo === 'function') {
                player.seekTo(0);
                player.playVideo();
            }
        },

        togglePlay() {
            if (!player || typeof player.pauseVideo !== 'function') return;
            this.isPlaying ? player.pauseVideo() : player.playVideo();
        },

        seekTo(sec) {
            if (player && typeof player.seekTo === 'function') player.seekTo(sec, true);
        },

        setVolume(val) {
            this.volume = val;
            if (player && typeof player.setVolume === 'function') player.setVolume(val);
        },

        startTimer() {
            if (timer) clearInterval(timer);
            timer = setInterval(() => {
                if (player && this.isPlaying && typeof player.getCurrentTime === 'function') {
                    this.currentTime = player.getCurrentTime();
                }
            }, 1000);
        },

        playRandomTrack() {
            if (this.allTracks.length > 0) {
                const rand = Math.floor(Math.random() * this.allTracks.length);
                this.setTrack(this.allTracks[rand]);
            }
        }
    }
});