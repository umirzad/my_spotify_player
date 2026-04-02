<template>
  <div class="app">
    <header class="header">
      <SearchBar @search="search" />
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
import { watch } from 'vue';
import SearchBar from './components/searchBar.vue';
import TrackList from './components/trackList.vue';
import PlayerBar from './components/playerBar.vue';
import { useMusic } from './composables/useMusic';
import { usePlayerStore } from './stores/player';

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

/* Kaydırma çubuğu tasarımı */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #121212; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #1db954; }
</style>