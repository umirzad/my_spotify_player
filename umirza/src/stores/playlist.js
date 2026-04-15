import { defineStore } from 'pinia';
import { API_BASE_URL } from '../config/api';
import { authHeaders } from '../utils/auth';

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
        const res = await fetch(`${API_BASE_URL}/get-playlists/${userId}`, {
          headers: {
            ...authHeaders(),
          },
        });
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
        const res = await fetch(`${API_BASE_URL}/create-playlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ userId, playlistName: name })
        });
        if (res.ok) {
          await this.fetchPlaylists(userId);
          return true;
        }
      } catch (err) { return false; }
    },

    async deletePlaylist(userId, playlistName) {
      try {
        const res = await fetch(`${API_BASE_URL}/delete-playlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ userId, playlistName })
        });
        if (res.ok) {
          this.selectedPlaylist = null;
          await this.fetchPlaylists(userId);
          return true;
        }
      } catch (err) { 
        console.error(err);
      }
      return false;
    },

    async renamePlaylist(userId, oldName, newName) {
      if (!newName || newName === oldName) return;
      try {
        const res = await fetch(`${API_BASE_URL}/rename-playlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ userId, oldName, newName })
        });
        if (res.ok) {
          await this.fetchPlaylists(userId);
          return true;
        }
      } catch (err) { 
        console.error(err); 
      }
      return false;
    },

    selectPlaylist(playlist) {
      this.selectedPlaylist = playlist;
    },

    clearSelection() {
      this.selectedPlaylist = null;
    }
  }
});