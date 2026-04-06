const express=require('express');
const cors=require('cors');
const axios=require('axios');
const NodeCache=require('node-cache');


const app=express();
const myCache=new NodeCache({stdTTL:3600});

app.use(cors());

const YOUTUBE_API_KEY="AIzaSyDbxxQwVkdKAXGaRB1x_DKYGJjU6s1Mwf4";

app.get('/',(req,res)=> res.send("Youtube apı hazır"));

app.get('/search-with-images',async(req,res)=>{
    const rawQurey=req.query.q;
    if(!rawQurey) return res.json([]);
    const query=rawQurey.trim().toLowerCase();

    const cached=myCache.get(query);
    if(cached) return res.json(cached);

    try{
        const response=await axios.get('https://www.googleapis.com/youtube/v3/search',{
            params:{
                part:'snippet',
                q:query,
                type:'video',
                maxResults:10,
                videoCategoryId:'10',
                key:YOUTUBE_API_KEY    
            }
        });

        const tracks=response.data.items.map(item=>({
            name:item.snippet.title,
            artist:item.snippet.channelTitle,
            youtubeThumb:item.snippet.thumbnails.high.url,
            duration:"0:00"
        }));

        myCache.set(query,tracks);
        res.json(tracks);
    }catch(err){
        console.error("Youtube apı hatası:",err.response ? err.response.data:err.message);

        res.status(500).json({error:"Arama sırasında bir hata oluştu"});
    }
});

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Sunucu ${PORT} portunda aktif`));
