# app.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx

app = FastAPI(title="Real TikTok Scraper API", version="3.0.0")

# Fake TikTok app User-Agent (iPhone)
TIKTOK_HEADERS = {
    "User-Agent": "TikTok 27.6.4 rv:276040 (iPhone; iOS 15.5; en_US)",
    "Accept": "application/json",
    "Accept-Encoding": "gzip",
    "Connection": "keep-alive"
}

@app.get("/")
async def root():
    return {"message": "✅ Real TikTok Scraper API is running"}

@app.get("/scrape")
async def scrape_tiktok(
    url: str = Query(..., description="Full TikTok video URL"),
    hd: int = Query(1, description="Get HD video (optional)")
):
    try:
        # Step 1: Extract video ID from TikTok URL
        if "/video/" not in url:
            raise HTTPException(status_code=400, detail="Invalid TikTok URL format.")
        
        video_id = url.split("/video/")[1].split("?")[0]

        # Step 2: TikTok App API endpoint
        api_url = f"https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id={video_id}"

        # Step 3: Send request to TikTok
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(api_url, headers=TIKTOK_HEADERS)
            response.raise_for_status()
            data = response.json()

        # Step 4: Parse data
        if not data.get("aweme_list"):
            raise HTTPException(status_code=404, detail="Video not found.")

        aweme = data["aweme_list"][0]

        result = {
            "code": 0,
            "msg": "success",
            "processed_time": 0.5,
            "data": {
                "id": aweme["aweme_id"],
                "title": aweme["desc"],
                "cover": aweme["video"]["cover"]["url_list"][0],
                "duration": aweme["video"]["duration"] // 1000,
                "play": aweme["video"]["play_addr"]["url_list"][0],
                "wmplay": aweme["video"]["download_addr"]["url_list"][0],
                "music": aweme["music"]["play_url"]["url_list"][0],
                "music_info": {
                    "id": aweme["music"]["id"],
                    "title": aweme["music"]["title"],
                    "play": aweme["music"]["play_url"]["url_list"][0],
                    "cover": aweme["music"]["cover_thumb"]["url_list"][0],
                    "author": aweme["music"]["author"],
                    "original": aweme["music"]["original"],
                    "duration": aweme["music"]["duration"]
                },
                "author": {
                    "id": aweme["author"]["uid"],
                    "unique_id": aweme["author"]["unique_id"],
                    "nickname": aweme["author"]["nickname"],
                    "avatar": aweme["author"]["avatar_thumb"]["url_list"][0]
                },
                "play_count": aweme["statistics"]["play_count"],
                "digg_count": aweme["statistics"]["digg_count"],
                "comment_count": aweme["statistics"]["comment_count"],
                "share_count": aweme["statistics"]["share_count"],
                "create_time": aweme["create_time"]
            }
        }

        return JSONResponse(content=result)

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping TikTok: {str(e)}")
