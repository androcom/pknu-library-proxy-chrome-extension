// 패턴 목록을 저장할 변수
let patterns = [];

// patterns.json 파일을 fetch API로 불러와서 patterns 변수에 저장
fetch(chrome.runtime.getURL('patterns.json'))
  .then((response) => response.json())
  .then((data) => {
    patterns = data;
    console.log("URL patterns loaded:", patterns);
  })
  .catch((error) => console.error("Error loading patterns:", error));

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const originalUrl = details.url;

    // 불러온 패턴 목록 중 하나라도 URL에 포함되는지 확인
    const isMatch = patterns.some(pattern => originalUrl.includes(pattern));

    if (isMatch) {
      const proxyPrefix = "https://libproxy.pknu.ac.kr/_Lib_Proxy_Url/";
      const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
      const modifiedUrl = proxyPrefix + urlWithoutProtocol;

      return { redirectUrl: modifiedUrl };
    }
  },
  {
    urls: ["<all_urls>"], // 모든 URL 요청을 감시
    types: ["main_frame"]
  },
  ["blocking"]
);