<template>
  <div class="app">
    <header class="header">
      <SearchBar @search="search" />

      <div class="user-actions">
        <span class="user-email">{{ userEmail }}</span>
        <button @click="hamdleLogout" class="logout-btn">
            Çıkış yap
        </button>
      </div>
    </header>

    <main class="content">
      <div v-if="loading" class="status">Şarkılar yükleniyor...</div>
      
      <TrackList 
        v-else 
        :tracks="results" 
        @play="handlePlay" 
      />
    </main>

   <PlayerBar 
  :track="playerStore.currentTrack" 
  :isPlaying="playerStore.isPlaying"
  :currentTime="playerStore.currentTime"
  :duration="playerStore.duration"
  :volume="playerStore.volume"
  :isReplay="playerStore.isReplay"
  @toggle="playerStore.togglePlay" 
  @seek="playerStore.seekTo"
  @volumeChange="playerStore.setVolume"
  @toggleReplay="playerStore.toggleReplay"
  @prev="playerStore.playPreviousTrack"
  @next="playerStore.playNextTrack"
  @random="playerStore.playRandomTrack" 
/>

    <div id="youtube-player" style="display: none;"></div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { watch } from 'vue';
import SearchBar from '../components/searchBar.vue';
import TrackList from '../components/trackList.vue';
import PlayerBar from '../components/playerBar.vue';
import { useMusic } from '../composables/useMusic';
import { usePlayerStore } from '../stores/player';

const router=useRouter();


const { results, loading, search } = useMusic();
const playerStore = usePlayerStore();

// Arama sonuçları her değiştiğinde (yeni arama yapıldığında) 
// listeyi Store'a gönderiyoruz ki "rastgele çalma" çalışabilsin.
watch(results, (newResults) => {
  playerStore.setTracks(newResults);
});

const handlePlay = (track) => {
  playerStore.setTrack(track);
};

const hamdleLogout=()=>{
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    router.push('/login')
};
</script>

<style>
/* Global Sıfırlama */
body {
  background-color: #121212;
  color: white;
  margin: 0;
  padding: 0;
  font-family: 'Circular', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* Alt barın üstünü kapatmaması için boşluk */
  padding-bottom: 110px; 
}

.header {
  padding: 20px;
  background: linear-gradient(to bottom, #1db95433, #121212);
  position: sticky;
  top: 0;
  z-index: 100;
}

.content {
  padding: 0 20px;
}

.status {
  text-align: center;
  margin-top: 100px;
  font-size: 1.2rem;
  color: #1db954;
  font-weight: bold;
}
.header-content{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

}

.user-actions{
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-email{
    color: #b3b3b3;
    font-size: 0.9rem;
    font-weight: 500;
}

.logout-btn{
    background-color: rgba(0,0,0,0.7);
    color: white;
    border: 1px solid #727272;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.logout-btn:hover{
    border-color: white;
    transform: scale(1.05);
    background-color: #282828;
}

@media(max-width:600px){
    .user-email{display: none;}
}




/* Kaydırma çubuğu tasarımı */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #121212; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #1db954; }
</style>