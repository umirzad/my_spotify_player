import { ref } from 'vue';
import { usePlayerStore } from '../stores/player';

export function useMusic() {
    const results = ref([]);
    const loading = ref(false);

    const search = async (query) => {
        if (!query || query.length < 2) return;
        loading.value = true;
        try {
            const res = await fetch(`http://localhost:3000/search-with-images?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            results.value = data;

            const playerStore=usePlayerStore();
            playerStore.setTracks(data);
        } catch (err) {
            console.error("Arama sırasında hata oluştu:", err);
        } finally {
            loading.value = false;
        }
    };

    return { results, loading, search };
}