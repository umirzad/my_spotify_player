<template>
    <div class="search-container">
        <div class="search-box">
            <input 
                v-model="query"
                @focus="showPanel = true"
                @keyup.enter="handleSearch"
                placeholder="Sarki, sanatci ara"
            >
            <button @click="handleSearch">Ara</button>
        </div>

        <div v-if="showPanel" class="suggestion-panel">
            <div class="section-title">Son aramalar</div>
            <button
                v-for="item in recentSearches"
                :key="item"
                class="suggestion-item"
                @click="pickSuggestion(item)"
            >
                {{ item }}
            </button>

            <div class="section-title">Hizli oneriler</div>
            <button
                v-for="item in quickSuggestions"
                :key="item"
                class="suggestion-item"
                @click="pickSuggestion(item)"
            >
                {{ item }}
            </button>
        </div>
    </div>
</template>


<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const SEARCH_HISTORY_KEY = 'searchHistory';
const query = ref('');
const showPanel = ref(false);
const recentSearches = ref([]);
const debounceTimer = ref(null);
const emit = defineEmits(['search']);

const quickSuggestions = computed(() => {
    const base = ['lofi chill', 'turkce pop', 'yabanci hitler', 'focus mix', 'rock classics'];
    const normalized = query.value.trim().toLowerCase();
    return base
        .filter((item) => item.includes(normalized))
        .slice(0, 5);
});

const loadHistory = () => {
    try {
        const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
        recentSearches.value = raw ? JSON.parse(raw) : [];
    } catch (err) {
        recentSearches.value = [];
    }
};

const saveSearch = (value) => {
    const q = String(value || '').trim();
    if (!q) return;
    recentSearches.value = [q, ...recentSearches.value.filter((item) => item !== q)].slice(0, 8);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(recentSearches.value));
};

const handleSearch = () => {
    const q = query.value.trim();
    if (q) {
        emit('search', q);
        saveSearch(q);
        showPanel.value = false;
    }
};

const pickSuggestion = (value) => {
    query.value = value;
    handleSearch();
};

const onClickOutside = (event) => {
    const root = event.target.closest('.search-container');
    if (!root) showPanel.value = false;
};

watch(query, (value) => {
    if (debounceTimer.value) clearTimeout(debounceTimer.value);
    debounceTimer.value = setTimeout(() => {
        if (value.trim().length >= 2) {
            emit('search', value.trim());
        }
    }, 450);
});

onMounted(() => {
    loadHistory();
    document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', onClickOutside);
    if (debounceTimer.value) clearTimeout(debounceTimer.value);
});

</script>

<style scoped>
.search-container { position: relative; max-width: 600px; margin: 0 auto; width: 100%; }
.search-box { display: flex; gap: 10px; }
input { flex: 1; padding: 10px 14px; border-radius: 20px; border: 1px solid #333; background: #222; color: white; }
button { padding: 10px 20px; border-radius: 20px; background: #1db954; color: white; border: none; cursor: pointer; }

.suggestion-panel {
    position: absolute;
    z-index: 50;
    top: 50px;
    width: 100%;
    background: #1d1d1d;
    border: 1px solid #2d2d2d;
    border-radius: 12px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.section-title {
    color: #9f9f9f;
    font-size: 12px;
    margin-top: 4px;
}

.suggestion-item {
    text-align: left;
    background: #2a2a2a;
    border: 1px solid transparent;
    color: #fff;
    border-radius: 8px;
    padding: 8px 10px;
}

.suggestion-item:hover {
    border-color: #1db954;
}
</style>
