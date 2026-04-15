import { defineStore } from "pinia";
import { API_BASE_URL } from '../config/api';

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
            // Eğer geri tuşuna basılmadıysa mevcut şarkıyı geçmişe at
            if (!isBack && this.currentTrack) {
                this.history.push(this.currentTrack);
            }

            this.currentTrack = track;
            this.currentTime = 0;
            
            // 1. ÖNCELİK: Eğer şarkı nesnesinde zaten bir videoId varsa direkt çal
            if (track.videoId) {
                console.log("Direkt videoId ile başlatılıyor:", track.videoId);
                this.playVideo(track.videoId);
            } 
            // 2. İKİNCİ ÖNCELİK: ID yoksa Render API üzerinden YouTube'da ara
            else {
                // Hem 'title' hem 'name' kontrolü yaparak veri kaçırmıyoruz
                const trackName = track.title || track.name || "";
                const artistName = track.artist || "";
                const searchTerm = `${artistName} ${trackName}`.trim();

                if (!searchTerm || searchTerm === "undefined undefined") {
                    console.error("Hata: Arama terimi geçersiz!");
                    return;
                }

                try {
                    console.log("Render API üzerinden aranıyor:", searchTerm);
                    const res = await fetch(`${API_BASE_URL}/play?q=${encodeURIComponent(searchTerm)}`);
                    const data = await res.json();
                    
                    if (data.id) {
                        // Bulunan ID'yi nesneye işle (bir sonraki tıklamada API'ye gitmesin)
                        track.videoId = data.id; 
                        this.playVideo(data.id);
                    } else {
                        console.warn("YouTube üzerinde eşleşen bir video bulunamadı.");
                    }
                } catch (err) { 
                    console.error("Render API bağlantı hatası:", err); 
                }
            }
        },

        playVideo(videoId) {
            if (player && typeof player.loadVideoById === 'function') {
                try {
                    player.loadVideoById(videoId);
                    this.isPlaying = true;
                } catch (e) {
                    this.initYoutubePlayer(videoId);
                }
            } else {
                this.initYoutubePlayer(videoId);
            }
        },

        initYoutubePlayer(videoId) {
            const playerDiv = document.getElementById('youtube-player');
            if (playerDiv) playerDiv.innerHTML = '';

            const onPlayerReady = () => {
                player = new window.YT.Player('youtube-player', {
                    height: '0', 
                    width: '0', 
                    videoId: videoId,
                    playerVars: { 
                        'autoplay': 1, 
                        'controls': 0, 
                        'origin': window.location.origin,
                        'enablejsapi': 1,
                        'widget_referrer': window.location.origin
                    },
                    events: {
                        'onReady': (e) => {
                            e.target.setVolume(this.volume);
                            e.target.playVideo();
                            this.startTimer();
                        },
                        'onStateChange': (e) => {
                            // 1 = Oynatılıyor, 2 = Duraklatıldı, 0 = Bitti
                            this.isPlaying = (e.data === window.YT.PlayerState.PLAYING);
                            if (e.data === window.YT.PlayerState.PLAYING) {
                                this.duration = player.getDuration();
                            }
                            if (e.data === window.YT.PlayerState.ENDED) {
                                if (this.isReplay && this.currentTrack?.videoId) {
                                    this.playVideo(this.currentTrack.videoId);
                                } else {
                                    this.playNextTrack();
                                }
                            }
                        },
                        'onError': (e) => {
                            console.error("YouTube Player Hatası:", e.data);
                            this.playNextTrack(); // Hata varsa sıradakine geç
                        }
                    }
                });
            };

            if (window.YT && window.YT.Player) {
                onPlayerReady();
            } else {
                if (!document.querySelector('script[src*="iframe_api"]')) {
                    const tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    document.head.appendChild(tag);
                }
                window.onYouTubeIframeAPIReady = onPlayerReady;
            }
        },

        playPreviousTrack() {
            if (this.history.length > 0) {
                const lastTrack = this.history.pop();
                this.setTrack(lastTrack, true);
            } else {
                this.seekTo(0);
            }
        },

        playNextTrack() {
            if (this.allTracks.length > 0 && this.currentTrack) {
                const currentIndex = this.allTracks.findIndex(t => 
                    (t.videoId && t.videoId === this.currentTrack.videoId) || 
                    (t.name === this.currentTrack.name) ||
                    (t.title === this.currentTrack.title)
                );
                
                let nextIndex;
                if (currentIndex !== -1 && currentIndex < this.allTracks.length - 1) {
                    nextIndex = currentIndex + 1;
                } else {
                    nextIndex = 0;
                }
                this.setTrack(this.allTracks[nextIndex]);
            } else {
                this.playRandomTrack();
            }
        },

        togglePlay() {
            if (!player || typeof player.pauseVideo !== 'function') return;
            if (this.isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        },

        seekTo(sec) {
            if (player && typeof player.seekTo === 'function') {
                player.seekTo(sec, true);
            }
        },

        setVolume(val) {
            this.volume = val;
            if (player && typeof player.setVolume === 'function') {
                player.setVolume(val);
            }
        },

        toggleReplay() {
            this.isReplay = !this.isReplay;
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