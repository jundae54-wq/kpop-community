async function debugRSS() {
    const url = 'https://www.soompi.com/feed';
    console.log('Fetching:', url);
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }); // try /feed  or /rss
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('First 500 chars:', text.substring(0, 500));
}

debugRSS();
