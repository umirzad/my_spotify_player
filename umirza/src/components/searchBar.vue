<template>
    <div class="search-container">
        <input 
        v-model="query"
        @keyup.enter="handleSearch"
        placeholder="Şarkı , sanatçı ara">

        <button @click="handleSearch">Ara</button>
    </div>
</template>


<script setup>
import { ref } from 'vue';
const query=ref('')
const emit=defineEmits(['search'])

const handleSearch=()=>{
    if(query.value.trim()){
        emit('search',query.value)
    }
}

</script>

<style scoped>
.search-container { padding: 20px; display: flex; gap: 10px; justify-content: center; }
input { padding: 10px; border-radius: 20px; border: 1px solid #333; background: #222; color: white; width: 300px; }
button { padding: 10px 20px; border-radius: 20px; background: #1db954; color: white; border: none; cursor: pointer; }
</style>
