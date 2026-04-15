<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2 class="auth-title">{{ isLogin? 'Giriş yap':'Kayıt Ol' }}</h2>

            <form @submit.prevent="handleSubmit">
                <div class="input-group">
                    <label>Email</label>
                    <input v-model="email" type="email" placeholder="email@örenk.com" required>

                </div>
                <div class="input-group">
                    <label>Şifre</label>
                    <input v-model="password" type="password" placeholder="********" required>
                </div>

                <button type="submit" class="auth-button">
                    {{ isLogin?'Giriş Yap':'Hesap Oluştur' }}
                </button>
            </form>

            <p @click="isLogin=!isLogin" class="auth-switch">
                {{ isLogin ? 'Hesabın yok mu ? Kayıt Ol': 'Zaren hesabun var mı ? Giriş Yap' }}
            </p>

            <p v-if="message" :class="['message',isError?'error':'success']">{{ message }}</p>
        </div>
    </div>
</template>



<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_BASE_URL } from '../config/api';

const isLogin=ref(true);
const email=ref('');
const password=ref('');
const message=ref('');
const isError=ref(false);
const router=useRouter();

const handleSubmit=async()=>{
    const endpoint=isLogin.value? '/login':'/register';
    const API_URL=`${API_BASE_URL}${endpoint}`;

    try{
        const res=await fetch(API_URL,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email:email.value,password:password.value})
        })

        const data=await res.json();

        if(!res.ok){
            isError.value=true;
            message.value=data.message || 'Bir hata oluştu';
        }else{
            isError.value=false;
            message.value=isLogin.value?'Giris basarili! Yonlendiriliyorsun...':'Kayit basarili! Simdi giris yapabilirsin.';

            if(isLogin.value){
                localStorage.setItem('userToken',data.token);
                localStorage.setItem('userData',JSON.stringify(data.user));

                setTimeout(()=>router.push('/'),1500)
            }else{
                isLogin.value=true;
            }
        }
    }catch(err){
        isError.value=true;
        message.value="Sunucuya baglanamadi";
    }
}

</script>

<style scoped>
.auth-container{
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #121212;
}

.auth-card{
    background: #181818;
    padding: 2.5rem;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0,0, 0,0.5);
}

.auth-title{
    color: white;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.8rem;
}

.input-group{
    margin-bottom: 1.5rem;
}

.input-group label{
    display: block;
    color: #b3b3b3;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.input-group input{
    width: 100%;
    padding: 12px;
    background: #282828;
    border: 1px solid transparent;
    border-radius: 4px;
    color: white;
    outline: none;
}

.input-group input:focus{
    border-color: #1db954;
}

.auth-button{
    width: 100%;
    padding: 14px;
    background-color: #1db954;
    color: black;
    border: none;
    border-radius: 50px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
}

.auth-button:hover{
    transform: scale(1.02);

}

.auth-switch{
    color: #b3b3b3;
    text-align: center;
    margin-top: 1.5rem;
    cursor: pointer;
    font-size: 0.85rem;
}

.auth-switch:hover{
    text-decoration: underline;
    color: white;
}

.message{
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
}

.error{color: #f15555;}
.success{color: #1db954;}
</style>