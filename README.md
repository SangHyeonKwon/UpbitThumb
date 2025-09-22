# 🪙 업비트 vs 빗썸 실시간 가격 비교

한국의 대표 암호화폐 거래소인 업비트와 빗썸의 실시간 가격을 비교하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **실시간 가격 조회**: 10개 주요 암호화폐의 실시간 가격 정보
- **가격 차이 분석**: 두 거래소 간 가격 차이를 원화 및 백분율로 표시
- **자동 새로고침**: 15초마다 자동으로 최신 가격 업데이트
- **정렬 기능**: 코인명, 가격차이, 차이율 기준으로 정렬 가능
- **반응형 디자인**: 모바일과 데스크톱에서 최적화된 화면

## 🎯 지원 암호화폐

- 비트코인 (BTC)
- 이더리움 (ETH)
- 리플 (XRP)
- 에이다 (ADA)
- 폴카닷 (DOT)
- 체인링크 (LINK)
- 폴리곤 (MATIC)
- 솔라나 (SOL)
- 아발란체 (AVAX)
- 도지코인 (DOGE)

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: 업비트 Open API, 빗썸 Public API
- **스타일링**: CSS Grid, Flexbox, 반응형 웹 디자인

## 🚀 설치 및 실행

1. 파일 다운로드 후 로컬 서버에 업로드
2. 웹 브라우저에서 `index.html` 파일 열기
3. CORS 정책으로 인해 로컬에서 실행 시 간단한 웹 서버 필요

### 로컬 웹 서버 실행 방법

```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000

# Node.js (http-server 패키지 설치 후)
npx http-server

# PHP
php -S localhost:8000
```

## 📱 사용법

1. **실시간 가격 확인**: 페이지 로드 시 자동으로 두 거래소의 가격을 불러옵니다
2. **정렬 기능**: 드롭다운에서 원하는 정렬 기준을 선택하세요
3. **수동 새로고침**: 새로고침 버튼으로 언제든 최신 데이터를 가져올 수 있습니다
4. **가격 차이 확인**: 빨간색은 더 비싼 가격, 파란색은 더 저렴한 가격을 의미합니다

## 🎨 UI 특징

- **업비트**: 파란색 계열로 표시
- **빗썸**: 주황색 계열로 표시
- **가격 차이**: 양수(빨간색), 음수(파란색)로 구분
- **높은 가격**: 연한 초록색 배경으로 강조

## 📊 API 정보

### 업비트 API
- **Endpoint**: `https://api.upbit.com/v1/ticker`
- **Documentation**: https://docs.upbit.com/reference

### 빗썸 API  
- **Endpoint**: `https://api.bithumb.com/public/ticker`
- **Documentation**: https://apidocs.bithumb.com/

## ⚠️ 주의사항

- API 호출 제한으로 인해 너무 자주 새로고침하지 마세요
- CORS 정책으로 인해 일부 브라우저에서 로컬 실행 시 제한이 있을 수 있습니다
- API 장애 시 시뮬레이션 데이터가 표시됩니다

## 🔧 커스터마이징

### 코인 추가/변경
`app.js` 파일의 `coins` 배열에서 코인 목록을 수정할 수 있습니다:

```javascript
this.coins = [
    {"upbit": "KRW-BTC", "bithumb": "BTC", "name": "비트코인", "symbol": "BTC"},
    // 새로운 코인 추가...
];
```

### 업데이트 주기 변경
`updateInterval` 값을 수정하여 자동 새로고침 간격을 조정할 수 있습니다:

```javascript
this.updateInterval = 30000; // 30초
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

버그 리포트, 기능 제안, 풀 리퀘스트를 환영합니다!

---

**⚡ 실시간 암호화폐 가격으로 더 나은 투자 결정을 하세요!**