import { ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import { API_BASE_URL } from '../config/api';

export function useMusic() {
    const results = ref([]);
    const loading = ref(false);
    const error = ref('');
    const lastQuery = ref('');

    const search = async (query, force = false) => {
        const normalizedQuery = String(query || '').trim();
        if (!normalizedQuery || normalizedQuery.length < 2) return;
        if (!force && normalizedQuery === lastQuery.value && results.value.length > 0) return;

        loading.value = true;
        error.value = '';
        lastQuery.value = normalizedQuery;

        try {
            const res = await fetch(`${API_BASE_URL}/search-with-images?q=${encodeURIComponent(normalizedQuery)}`);
            if (!res.ok) {
                throw new Error('Arama servisinden beklenmeyen bir cevap geldi.');
            }
            const data = await res.json();
            
            const formattedData = data.map(song => ({
                ...song,
                title: song.name,
                thumbnail: song.youtubeThumb,
                artist: song.artist
            }));

            results.value = formattedData;

            const playerStore = usePlayerStore();
            playerStore.setTracks(formattedData);
        } catch (err) {
            error.value = err.message || 'Arama sirasinda bir sorun olustu.';
            console.error("Arama sırasında hata oluştu:", err);
        } finally {
            loading.value = false;
        }
    };

    const retrySearch = async () => {
        if (!lastQuery.value) return;
        await search(lastQuery.value, true);
    };

    return { results, loading, error, lastQuery, search, retrySearch };
}