// 정규표현식 특수문자 이스케이프
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 규칙 업데이트 함수
async function updateRules() {
  // patterns.json 불러오기
  const response = await fetch(chrome.runtime.getURL('patterns.json'));
  const patterns = await response.json();

  // patterns.json로 declarativeNetRequest 규칙 생성
  const rules = patterns.map((pattern, index) => {
    // 정규표현식에 사용 가능하도록 특수문자 이스케이프
    const escapedPattern = escapeRegex(pattern);
    return {
      id: index + 1,
      priority: 1,
      condition: {
        // "프로토콜(패턴 + 나머지 주소)" 형태의 URL을 감지하는 정규표현식
        regexFilter: '^https?:\\/\\/(${escapedPattern}.*)',
        resourceTypes: ['main_frame']
      },
      action: {
        type: 'redirect',
        redirect: {
          // 정규표현식을 사용하여 URL 재구성
          regexSubstitution: 'https://libproxy.pknu.ac.kr/_Lib_Proxy_Url/\\1'
        }
      }
    };
  });


  // declarativeNetRequest로 생성된 동적 규칙의 영속성

  // 기존 규칙 확인
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);
  
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds, // 기존 규칙 전체 삭제
    addRules: rules // 새 규칙 추가
  });

  console.log("Redirect rules updated successfully!", rules);
}

// 확장 프로그램이 처음 설치됐을 때, 업데이트될 때, 브라우저가 시작될 때 실행
chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});