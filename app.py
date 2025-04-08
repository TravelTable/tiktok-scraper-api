# app.py
from fastapi import FastAPI, Query, HTTPException, Header
from fastapi.responses import JSONResponse
import httpx
from bs4 import BeautifulSoup
import random
import os
import json

app = FastAPI(title="TikTok Scraper API", version="1.2.0")

# User-Agent list
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
]

# Free public proxies (rotate these)
FREE_PROXIES = [
    "http://195.154.255.194:80",
    "http://51.158.123.35:8811",
    "http://165.227.71.60:80",
    "http://159.89.163.128:8080"
]

# Get API_KEY from environment variable or fallback
API_KEY = os.getenv("API_KEY", "your-secret-api-key")  # Secure 🔒

def random_user_agent():
    return random.choice(USER_AGENTS)

def random_proxy():
    return random.choice(FREE_PROXIES)

@app.get("/")
async def root():
    return {"message": "✅ TikTok Scraper API is running"}

@app.get("/scrape")
async def scrape_tiktok(
    url: str = Query(..., description="Full TikTok Video URL"),
    x_api_key: str = Header(None)
):
    # ✅ Check API Key
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    headers = {
        "User-Agent": random_user_agent(),
        "Accept-Language": "en-US,en;q=0.9",
    }
    
    proxies = {
        "http://": random_proxy(),
        "https://": random_proxy()
    }

    try:
        async with httpx.AsyncClient(timeout=10, proxies=proxies) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            html = response.text

            soup = BeautifulSoup(html, "html.parser")
            sigi_script = soup.find("script", {"id": "SIGI_STATE"})
            if not sigi_script:
                raise HTTPException(status_code=500, detail="Unable to find TikTok data script.")

            json_data = sigi_script.string
            data = json.loads(json_data)

            video_id = list(data["ItemModule"].keys())[0]
            video = data["ItemModule"][video_id]
            user = data["UserModule"]["users"][video["author"]]

            result = {
                "id": video_id,
                "description": video.get("desc"),
                "createTime": video.get("createTime"),
                "duration": video["video"].get("duration"),
                "videoUrlWithWatermark": video["video"].get("playAddr"),
                "videoUrlNoWatermark": video["video"].get("downloadAddr"),
                "coverImageUrl": video["video"].get("cover"),
                "likeCount": video["stats"].get("diggCount"),
                "commentCount": video["stats"].get("commentCount"),
                "shareCount": video["stats"].get("shareCount"),
                "viewCount": video["stats"].get("playCount"),
                "hashtags": [tag.get("hashtagName") for tag in video.get("textExtra", [])],
                "music": {
                    "id": video["music"].get("id"),
                    "title": video["music"].get("title"),
                    "authorName": video["music"].get("authorName"),
                    "playUrl": video["music"].get("playUrl")
                },
                "user": {
                    "username": user.get("uniqueId"),
                    "nickname": user.get("nickname"),
                    "avatar": user.get("avatarLarger"),
                    "signature": user.get("signature"),
                    "followerCount": user["stats"].get("followerCount"),
                    "followingCount": user["stats"].get("followingCount"),
                    "heartCount": user["stats"].get("heartCount"),
                    "verified": user.get("verified")
                }
            }

            return JSONResponse(content=result)

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping TikTok: {str(e)}")
