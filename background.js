// 프록시를 적용할 대상 도메인 목록
const TARGET_DOMAINS = [
  "dbpia.co.kr",
  "riss.kr",
  "kiss.kstudy.com"
];

// 규칙을 생성하고 적용하는 메인 함수
async function updateRules() {
  const rules = [];
  // 각 도메인에 대한 리다이렉트 규칙을 생성합니다.
  for (let i = 0; i < TARGET_DOMAINS.length; i++) {
    const domain = TARGET_DOMAINS[i];
    rules.push({
      // 각 규칙에 고유한 ID를 부여합니다.
      id: i + 1,
      priority: 1,
      action: {
        type: 'redirect',
        // 최종적으로 리다이렉트될 URL 형식입니다.
        // \1은 정규식에서 캡처된 '도메인/경로' 부분을 의미합니다.
        redirect: {
          regexSubstitution: `https://libproxy.pknu.ac.kr/_Lib_Proxy_Url/\\1`
        }
      },
      condition: {
        // 'http' 또는 'https'로 시작하고, 지정된 도메인을 포함하는 모든 URL과 일치합니다.
        // 예: https://www.dbpia.co.kr/anything -> (www.dbpia.co.kr/anything) 캡처
        regexFilter: `^https?:\\/\\/((www\\.)?${domain.replace(/\./g, '\\.')}\\/.*)`,
        resourceTypes: ['main_frame']
      }
    });
  }

  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: rules
    });
    console.log("✅ 프록시 규칙이 성공적으로 업데이트되었습니다.", rules);
  } catch (error) {
    console.error("❌ 프록시 규칙 업데이트 중 오류 발생:", error);
  }
}

// 확장 프로그램이 처음 설치되거나 업데이트될 때 규칙을 적용합니다.
chrome.runtime.onInstalled.addListener(updateRules);

// 브라우저가 시작될 때마다 규칙을 다시 적용하여 안정성을 높입니다.
chrome.runtime.onStartup.addListener(updateRules);