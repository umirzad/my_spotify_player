import { defineStore } from 'pinia';

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    playlists: [],
    selectedPlaylist: null, // Ekranda o an açık olan playlist objesi
    loading: false
  }),

  actions: {
    // Tüm playlistleri getir
    async fetchPlaylists(userId) {
      if (!userId) return;
      this.loading = true;
      try {
        const res = await fetch(`https://my-spotify-player-tm8k.onrender.com/get-playlists/${userId}`);
        if (res.ok) {
          const data = await res.json();
          this.playlists = data;
          
          // Eğer bir liste seçiliyse, içeriğini güncelle (yeni şarkı gelmiş olabilir)
          if (this.selectedPlaylist) {
            const updated = this.playlists.find(p => p._id === this.selectedPlaylist._id);
            if (updated) this.selectedPlaylist = updated;
          }
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
          await this.fetchPlaylists(userId);
          return true;
        }
      } catch (err) {
        console.error("Liste oluşturma hatası:", err);
        return false;
      }
    },

    // Listeye tıklandığında onu seçili yap
    selectPlaylist(playlist) {
      this.selectedPlaylist = playlist;
    },

    // Arama yapıldığında veya ana sayfaya dönüldüğünde seçimi temizle
    clearSelection() {
      this.selectedPlaylist = null;
    }
  }
});