# app.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import JSONResponse
import httpx
from bs4 import BeautifulSoup
import random
import json

app = FastAPI(title="TikTok Scraper API", version="2.0.0")

# Paid proxies from Webshare
PAID_PROXIES = [
    "http://ihqqebfi:m65ebvc3vi3w@64.137.108.3:5596",
    "http://ihqqebfi:m65ebvc3vi3w@64.137.101.31:5345",
    "http://ihqqebfi:m65ebvc3vi3w@146.103.55.91:6143",
    "http://ihqqebfi:m65ebvc3vi3w@198.37.99.112:5903",
    "http://ihqqebfi:m65ebvc3vi3w@154.29.25.184:7195",
    "http://ihqqebfi:m65ebvc3vi3w@217.198.177.161:5677",
    "http://ihqqebfi:m65ebvc3vi3w@31.56.139.91:6160",
    "http://ihqqebfi:m65ebvc3vi3w@91.124.253.231:6591",
    "http://ihqqebfi:m65ebvc3vi3w@193.161.2.249:6672",
    "http://ihqqebfi:m65ebvc3vi3w@37.44.218.222:5905",
    "http://ihqqebfi:m65ebvc3vi3w@64.137.48.126:6333",
    "http://ihqqebfi:m65ebvc3vi3w@69.58.9.142:7212",
    "http://ihqqebfi:m65ebvc3vi3w@45.67.2.246:5820",
    "http://ihqqebfi:m65ebvc3vi3w@45.151.161.219:6310",
    "http://ihqqebfi:m65ebvc3vi3w@161.123.5.227:5276",
    "http://ihqqebfi:m65ebvc3vi3w@31.57.82.232:6813",
    "http://ihqqebfi:m65ebvc3vi3w@38.225.11.157:5438",
    "http://ihqqebfi:m65ebvc3vi3w@45.43.167.105:6287",
    "http://ihqqebfi:m65ebvc3vi3w@104.239.13.86:6715",
    "http://ihqqebfi:m65ebvc3vi3w@168.199.159.4:6065",
    "http://ihqqebfi:m65ebvc3vi3w@104.222.168.209:6025",
    "http://ihqqebfi:m65ebvc3vi3w@216.173.80.68:6325",
    "http://ihqqebfi:m65ebvc3vi3w@38.225.3.104:5387",
    "http://ihqqebfi:m65ebvc3vi3w@104.252.71.156:6084",
    "http://ihqqebfi:m65ebvc3vi3w@104.253.13.195:5627",
    "http://ihqqebfi:m65ebvc3vi3w@184.174.25.40:5929",
    "http://ihqqebfi:m65ebvc3vi3w@67.227.119.23:6352",
    "http://ihqqebfi:m65ebvc3vi3w@67.227.1.236:6517",
    "http://ihqqebfi:m65ebvc3vi3w@162.220.246.158:6442",
    "http://ihqqebfi:m65ebvc3vi3w@45.138.119.165:5914",
    "http://ihqqebfi:m65ebvc3vi3w@104.168.118.246:6202",
    "http://ihqqebfi:m65ebvc3vi3w@194.116.249.20:5871",
    "http://ihqqebfi:m65ebvc3vi3w@38.170.175.32:5701",
    "http://ihqqebfi:m65ebvc3vi3w@154.29.233.2:5763",
    "http://ihqqebfi:m65ebvc3vi3w@38.170.171.86:5786",
    "http://ihqqebfi:m65ebvc3vi3w@45.131.102.5:5657",
    "http://ihqqebfi:m65ebvc3vi3w@64.137.80.118:5145",
    "http://ihqqebfi:m65ebvc3vi3w@103.76.117.121:6386",
    "http://ihqqebfi:m65ebvc3vi3w@107.181.142.233:5826",
    "http://ihqqebfi:m65ebvc3vi3w@199.180.9.163:6183",
    "http://ihqqebfi:m65ebvc3vi3w@216.74.80.218:6790",
    "http://ihqqebfi:m65ebvc3vi3w@31.59.27.49:6626",
    "http://ihqqebfi:m65ebvc3vi3w@45.38.86.225:6154",
    "http://ihqqebfi:m65ebvc3vi3w@45.39.31.72:5499",
    "http://ihqqebfi:m65ebvc3vi3w@188.215.7.225:6289",
    "http://ihqqebfi:m65ebvc3vi3w@192.3.48.130:6123",
    "http://ihqqebfi:m65ebvc3vi3w@206.206.71.44:5684",
    "http://ihqqebfi:m65ebvc3vi3w@23.27.203.133:6868",
    "http://ihqqebfi:m65ebvc3vi3w@31.59.10.54:5625",
    "http://ihqqebfi:m65ebvc3vi3w@87.239.253.180:6429",
    "http://ihqqebfi:m65ebvc3vi3w@82.23.209.150:5991",
    "http://ihqqebfi:m65ebvc3vi3w@104.249.31.7:6091",
    "http://ihqqebfi:m65ebvc3vi3w@140.99.194.213:7590",
    "http://ihqqebfi:m65ebvc3vi3w@168.199.132.199:6271",
    "http://ihqqebfi:m65ebvc3vi3w@193.36.172.7:6090",
    "http://ihqqebfi:m65ebvc3vi3w@45.39.4.38:5463",
    "http://ihqqebfi:m65ebvc3vi3w@104.143.246.13:5968",
    "http://ihqqebfi:m65ebvc3vi3w@148.135.151.132:5625",
    "http://ihqqebfi:m65ebvc3vi3w@191.96.171.38:6551",
    "http://ihqqebfi:m65ebvc3vi3w@45.43.94.72:7322",
    "http://ihqqebfi:m65ebvc3vi3w@50.114.28.42:5527",
    "http://ihqqebfi:m65ebvc3vi3w@82.21.219.127:6468",
    "http://ihqqebfi:m65ebvc3vi3w@142.111.255.170:5459",
    "http://ihqqebfi:m65ebvc3vi3w@194.5.3.168:5680",
    "http://ihqqebfi:m65ebvc3vi3w@67.227.1.216:6497",
    "http://ihqqebfi:m65ebvc3vi3w@104.239.97.253:6006",
    "http://ihqqebfi:m65ebvc3vi3w@37.44.218.131:5814",
    "http://ihqqebfi:m65ebvc3vi3w@45.41.172.186:5929",
    "http://ihqqebfi:m65ebvc3vi3w@173.239.219.86:5995",
    "http://ihqqebfi:m65ebvc3vi3w@23.26.71.123:5606",
    "http://ihqqebfi:m65ebvc3vi3w@45.41.177.59:5709",
    "http://ihqqebfi:m65ebvc3vi3w@92.113.237.254:7338",
    "http://ihqqebfi:m65ebvc3vi3w@104.239.90.244:6635",
    "http://ihqqebfi:m65ebvc3vi3w@142.111.34.54:6019",
    "http://ihqqebfi:m65ebvc3vi3w@154.29.239.88:6127",
    "http://ihqqebfi:m65ebvc3vi3w@64.137.83.114:6054",
    "http://ihqqebfi:m65ebvc3vi3w@82.23.220.138:7477",
    "http://ihqqebfi:m65ebvc3vi3w@206.232.13.192:5858",
    "http://ihqqebfi:m65ebvc3vi3w@216.173.99.112:6454",
    "http://ihqqebfi:m65ebvc3vi3w@23.95.255.159:6743",
    "http://ihqqebfi:m65ebvc3vi3w@64.137.57.115:6124",
    "http://ihqqebfi:m65ebvc3vi3w@64.137.101.225:5539",
    "http://ihqqebfi:m65ebvc3vi3w@82.22.223.151:6502",
    "http://ihqqebfi:m65ebvc3vi3w@82.22.254.254:6114",
    "http://ihqqebfi:m65ebvc3vi3w@89.116.78.236:5847",
    "http://ihqqebfi:m65ebvc3vi3w@89.213.137.152:7027",
    "http://ihqqebfi:m65ebvc3vi3w@142.111.126.4:6731",
    "http://ihqqebfi:m65ebvc3vi3w@82.24.225.28:7869",
    "http://ihqqebfi:m65ebvc3vi3w@92.249.34.153:5835",
    "http://ihqqebfi:m65ebvc3vi3w@108.165.180.100:6063",
    "http://ihqqebfi:m65ebvc3vi3w@145.223.53.173:6707",
    "http://ihqqebfi:m65ebvc3vi3w@38.154.227.24:5725",
    "http://ihqqebfi:m65ebvc3vi3w@92.113.232.159:7743",
    "http://ihqqebfi:m65ebvc3vi3w@136.0.184.59:6480",
    "http://ihqqebfi:m65ebvc3vi3w@142.111.58.41:6619",
    "http://ihqqebfi:m65ebvc3vi3w@154.95.36.193:6887",
    "http://ihqqebfi:m65ebvc3vi3w@156.243.181.192:5680",
    "http://ihqqebfi:m65ebvc3vi3w@64.137.96.117:6684",
    "http://ihqqebfi:m65ebvc3vi3w@138.128.145.114:6033",
    "http://ihqqebfi:m65ebvc3vi3w@142.111.245.44:5911",
    # 👉 (Add the rest of your 100 proxies here if you want even more rotation)
]

# User-Agent list
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
]

def random_user_agent():
    return random.choice(USER_AGENTS)

def random_proxy():
    return random.choice(PAID_PROXIES)

@app.get("/")
async def root():
    return {"message": "✅ TikTok Scraper API is running with paid proxies"}

@app.get("/scrape")
async def scrape_tiktok(
    url: str = Query(..., description="Full TikTok Video URL")
):
    headers = {
    "User-Agent": random_user_agent(),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Referer": "https://www.google.com/",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


    proxy = random_proxy()
    transport = httpx.AsyncHTTPTransport(proxy=proxy)

    try:
        async with httpx.AsyncClient(timeout=10, transport=transport) as client:
            response = await client.get(url, headers=headers, follow_redirects=True)
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
