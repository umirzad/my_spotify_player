const express=require('express')
const cors=require('cors')
const yts=require('yt-search')
const NodeCache=require('node-cache');

const app=express();
const myCache=new NodeCache({stdTTL:600});


app.use(cors());


app.get('/search-with-images', async(req,res)=>{
    const query=req.query.q;
    if(!query) return res.json([]);

    const coachedResult=myCache.get(query);
    if(coachedResult){
        console.log(`hafizadan getirildi: ${query}`);
    }

    try{
        console.log(`youtube dan veri çekiliyor: ${query}`);
        const result=await yts({query,hl:'tr',gl:'TR'});
        const videos=result.videos.slice(0,12);

        const tracks=videos.map(v=>({
            name:v.title,
            artist:v.author.name,
            youtubeThumb:v.thumbnail,
            videoId:v.videoId,
            duration:v.timestamp
        }));

        myCache.set(query,tracks);

        res.json(tracks);
    }catch(err){
        res.status(500).json({error:'arama yapılamadı'});

    }
});

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Sunucu ${PORT} portunda aktif`));