import { ref } from 'vue';
import { usePlayerStore } from '../stores/player';

export function useMusic() {
    const results = ref([]);
    const loading = ref(false);

    const search = async (query) => {
        if (!query || query.length < 2) return;
        loading.value = true;
        try {
            // ARTIK LOCALHOST DEĞİL, RENDER ADRESİN:
            const res = await fetch(`https://my-spotify-player-tm8k.onrender.com/search-with-images?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            results.value = data;

            const playerStore = usePlayerStore();
            playerStore.setTracks(data);
        } catch (err) {
            console.error("Arama sırasında hata oluştu:", err);
        } finally {
            loading.value = false;
        }
    };

    return { results, loading, search };
}