import { defineStore } from 'pinia';

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    playlists: [],
    loading: false
  }),

  actions: {
    // Tüm playlistleri getir
    async fetchPlaylists(userId) {
      this.loading = true;
      try {
        const res = await fetch(`https://my-spotify-player-tm8k.onrender.com/get-playlists/${userId}`);
        if (res.ok) {
          this.playlists = await res.json();
        }
      } catch (err) {
        console.error("Playlist çekme hatası:", err);
      } finally {
        this.loading = false;
      }
    },

    // Yeni playlist oluştur
    async createPlaylist(userId, name) {
      try {
        const res = await fetch('https://my-spotify-player-tm8k.onrender.com/create-playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, playlistName: name })
        });
        if (res.ok) {
          // Oluşturma başarılıysa listeyi güncellemek için tekrar çekiyoruz
          await this.fetchPlaylists(userId);
          return true;
        }
      } catch (err) {
        console.error("Liste oluşturma hatası:", err);
        return false;
      }
    }
  }
});