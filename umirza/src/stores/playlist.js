import { defineStore } from 'pinia';

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    playlists: [],
    selectedPlaylist: null,
    loading: false
  }),

  actions: {
    async fetchPlaylists(userId) {
      if (!userId) return;
      this.loading = true;
      try {
        const res = await fetch(`https://my-spotify-player-tm8k.onrender.com/get-playlists/${userId}`);
        if (res.ok) {
          const data = await res.json();
          this.playlists = data;
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
      } catch (err) { return false; }
    },

    // YENİ: Playlist Silme
    async deletePlaylist(userId, playlistName) {
      if (!confirm(`"${playlistName}" listesini silmek istediğine emin misin?`)) return;
      try {
        const res = await fetch('https://my-spotify-player-tm8k.onrender.com/delete-playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, playlistName })
        });
        if (res.ok) {
          this.selectedPlaylist = null;
          await this.fetchPlaylists(userId);
        }
      } catch (err) { console.error(err); }
    },

    // YENİ: Playlist İsmi Değiştirme
    async renamePlaylist(userId, oldName) {
      const newName = prompt("Yeni liste adı:", oldName);
      if (!newName || newName === oldName) return;
      try {
        const res = await fetch('https://my-spotify-player-tm8k.onrender.com/rename-playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, oldName, newName })
        });
        if (res.ok) {
          await this.fetchPlaylists(userId);
        }
      } catch (err) { console.error(err); }
    },

    selectPlaylist(playlist) {
      this.selectedPlaylist = playlist;
    },

    clearSelection() {
      this.selectedPlaylist = null;
    }
  }
});