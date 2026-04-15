import { ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import { API_BASE_URL } from '../config/api';

export function useMusic() {
    const results = ref([]);
    const loading = ref(false);

    const search = async (query) => {
        if (!query || query.length < 2) return;
        loading.value = true;
        try {
            const res = await fetch(`${API_BASE_URL}/search-with-images?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            // VERİ EŞLEME (MAPPING)
            // Backend'den gelen 'youtubeThumb'u 'thumbnail'e, 'name'i 'title'a çeviriyoruz
            const formattedData = data.map(song => ({
                ...song,
                title: song.name,      // Arayüzün 'title' bekliyorsa
                thumbnail: song.youtubeThumb, // Arayüzün 'thumbnail' bekliyorsa
                artist: song.artist
            }));

            results.value = formattedData;

            const playerStore = usePlayerStore();
            playerStore.setTracks(formattedData);
        } catch (err) {
            console.error("Arama sırasında hata oluştu:", err);
        } finally {
            loading.value = false;
        }
    };

    return { results, loading, search };
}