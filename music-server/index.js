const express=require('express');
const cors=require('cors');
const yts=require('yt-search');
const app=express()

app.use(cors());

app.get('/search-with-images',async(req,res)=>{
    const query=req.query.q;
    if(!query) return res.json([]);


    try{
        const result=await yts({query,hl:'tr',gl:'TR'});
        
        const videos=result.videos.slice(0,12);

        const tracks=videos.map(v=>({
            name:v.title,
            artist:v.author.name,
            youtubeThumb:v.thumbnail,
            videoId:v.videoId,
            duration:v.timestamp
        }));

        res.json(tracks);
    }catch(err){
        console.error("Arama Hatası:",err.message);
        res.status(500).json({error:"arama yapılamadı"})
    }
});

const PORT=proces.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Sunucu ${PORT} portunda aktif`));