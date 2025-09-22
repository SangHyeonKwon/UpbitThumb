// 암호화폐 가격 비교 애플리케이션 - v1.3 (유리한거래소 정렬옵션 제거)
class CryptoPriceComparator {
    constructor() {
        this.coins = []; // 동적으로 로드할 예정
        this.updateInterval = 15000; // 15초
        this.currentSort = 'name';
        this.priceData = [];
        this.intervalId = null;
        this.useMockData = false;
        this.isLoadingCoins = false;
        
        // API 키 설정
        this.apiKeys = {
            upbit: null,
            bithumb: null,
            bithumbSecret: null
        };
        
        // 다크모드 설정
        this.isDarkMode = false;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.loadTheme();
        this.loadApiKeys();
        await this.loadCoinList();
        await this.fetchPrices();
        this.startAutoUpdate();
    }
    
    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        const sortSelect = document.getElementById('sortSelect');
        const saveApiKeysBtn = document.getElementById('saveApiKeysBtn');
        const clearApiKeysBtn = document.getElementById('clearApiKeysBtn');
        const themeToggle = document.getElementById('themeToggle');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.fetchPrices();
            });
        }
        
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                e.preventDefault();
                this.currentSort = e.target.value;
                this.renderTable();
            });
        }

        // 화면 크기 변경 시 컬럼 업데이트
        window.addEventListener('resize', () => {
            this.updateTableColumns();
        });
        
        if (saveApiKeysBtn) {
            saveApiKeysBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveApiKeys();
            });
        }
        
        if (clearApiKeysBtn) {
            clearApiKeysBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearApiKeys();
            });
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }

    // 테마 로드
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('cryptoTheme');
            if (savedTheme) {
                this.isDarkMode = savedTheme === 'dark';
            } else {
                // 시스템 다크모드 설정 확인
                this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            this.applyTheme();
            this.setupSystemThemeListener();
        } catch (error) {
            console.error('테마 로드 실패:', error);
        }
    }

    // 시스템 테마 변경 감지
    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // 사용자가 수동으로 테마를 변경하지 않은 경우에만 시스템 설정 따름
            const savedTheme = localStorage.getItem('cryptoTheme');
            if (!savedTheme) {
                this.isDarkMode = e.matches;
                this.applyTheme();
            }
        });
    }

    // 테마 토글
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.saveTheme();
    }

    // 테마 적용
    applyTheme() {
        const html = document.documentElement;
        const themeIcon = document.getElementById('themeIcon');
        
        if (this.isDarkMode) {
            html.setAttribute('data-color-scheme', 'dark');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            html.setAttribute('data-color-scheme', 'light');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    }

    // 테마 저장
    saveTheme() {
        try {
            localStorage.setItem('cryptoTheme', this.isDarkMode ? 'dark' : 'light');
        } catch (error) {
            console.error('테마 저장 실패:', error);
        }
    }

    // API 키 로드
    loadApiKeys() {
        try {
            const savedKeys = localStorage.getItem('cryptoApiKeys');
            if (savedKeys) {
                this.apiKeys = JSON.parse(savedKeys);
                this.updateApiKeyInputs();
                this.updateApiStatus();
            }
        } catch (error) {
            console.error('API 키 로드 실패:', error);
        }
    }

    // API 키 저장
    saveApiKeys() {
        const upbitKey = document.getElementById('upbitApiKey').value.trim();
        const bithumbKey = document.getElementById('bithumbApiKey').value.trim();
        const bithumbSecret = document.getElementById('bithumbSecretKey').value.trim();

        this.apiKeys = {
            upbit: upbitKey || null,
            bithumb: bithumbKey || null,
            bithumbSecret: bithumbSecret || null
        };

        try {
            localStorage.setItem('cryptoApiKeys', JSON.stringify(this.apiKeys));
            this.updateApiStatus();
            this.showSuccessMessage('API 키가 저장되었습니다.');
        } catch (error) {
            console.error('API 키 저장 실패:', error);
            this.showError('API 키 저장에 실패했습니다.');
        }
    }

    // API 키 삭제
    clearApiKeys() {
        this.apiKeys = {
            upbit: null,
            bithumb: null,
            bithumbSecret: null
        };

        try {
            localStorage.removeItem('cryptoApiKeys');
            this.updateApiKeyInputs();
            this.updateApiStatus();
            this.showSuccessMessage('API 키가 삭제되었습니다.');
        } catch (error) {
            console.error('API 키 삭제 실패:', error);
            this.showError('API 키 삭제에 실패했습니다.');
        }
    }

    // API 키 입력 필드 업데이트
    updateApiKeyInputs() {
        document.getElementById('upbitApiKey').value = this.apiKeys.upbit || '';
        document.getElementById('bithumbApiKey').value = this.apiKeys.bithumb || '';
        document.getElementById('bithumbSecretKey').value = this.apiKeys.bithumbSecret || '';
    }

    // API 상태 업데이트
    updateApiStatus() {
        const statusEl = document.getElementById('apiStatus');
        if (!statusEl) return;

        const hasKeys = this.apiKeys.upbit || this.apiKeys.bithumb;
        
        if (hasKeys) {
            statusEl.textContent = 'API 키 설정됨';
            statusEl.classList.add('has-keys');
        } else {
            statusEl.textContent = 'API 키 없음';
            statusEl.classList.remove('has-keys');
        }
    }

    // 성공 메시지 표시
    showSuccessMessage(message) {
        // 간단한 토스트 메시지 구현
        const toast = document.createElement('div');
        toast.className = 'toast-message success';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 업비트에서 KRW 거래 가능한 모든 코인 목록 가져오기
    async fetchUpbitMarkets() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
            
            const response = await fetch('https://api.upbit.com/v1/market/all', {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`업비트 마켓 API 응답 오류: ${response.status} ${response.statusText}`);
            }
            
            const markets = await response.json();
            
            // KRW 마켓만 필터링
            return markets
                .filter(market => market.market.startsWith('KRW-'))
                .map(market => ({
                    symbol: market.market.replace('KRW-', ''),
                    market: market.market,
                    korean_name: market.korean_name,
                    english_name: market.english_name
                }));
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('업비트 마켓 API 타임아웃');
                throw new Error('업비트 API 응답 시간 초과 (10초)');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('업비트 마켓 API 네트워크 오류');
                throw new Error('업비트 API 네트워크 연결 실패 (CORS 또는 네트워크 문제)');
            } else {
                console.error('업비트 마켓 정보 가져오기 실패:', error);
                throw error;
            }
        }
    }

    // 빗썸에서 거래 가능한 모든 코인 목록 가져오기
    async fetchBithumbMarkets() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
            
            const response = await fetch('https://api.bithumb.com/public/ticker/ALL_KRW', {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`빗썸 마켓 API 응답 오류: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.status !== '0000') {
                throw new Error('빗썸 API 응답 오류: ' + data.message);
            }
            
            // 'date' 필드를 제외한 모든 코인 정보 추출
            const coins = Object.keys(data.data).filter(key => key !== 'date');
            
            return coins.map(symbol => ({
                symbol: symbol,
                name: symbol // 빗썸 API에는 한국어 이름이 없어서 심볼 사용
            }));
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('빗썸 마켓 API 타임아웃');
                throw new Error('빗썸 API 응답 시간 초과 (10초)');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('빗썸 마켓 API 네트워크 오류');
                throw new Error('빗썸 API 네트워크 연결 실패 (CORS 또는 네트워크 문제)');
            } else {
                console.error('빗썸 마켓 정보 가져오기 실패:', error);
                throw error;
            }
        }
    }

    // 두 거래소에서 공통으로 지원하는 코인 목록 생성
    async loadCoinList() {
        if (this.isLoadingCoins) return;
        
        this.isLoadingCoins = true;
        this.showLoading();
        
        try {
            const [upbitMarkets, bithumbMarkets] = await Promise.all([
                this.fetchUpbitMarkets(),
                this.fetchBithumbMarkets()
            ]);
            
            // 공통 코인 찾기
            const commonCoins = [];
            
            for (const upbitCoin of upbitMarkets) {
                const bithumbCoin = bithumbMarkets.find(
                    bCoin => bCoin.symbol === upbitCoin.symbol
                );
                
                if (bithumbCoin) {
                    commonCoins.push({
                        upbit: upbitCoin.market,
                        bithumb: upbitCoin.symbol,
                        symbol: upbitCoin.symbol,
                        name: upbitCoin.korean_name || upbitCoin.english_name || upbitCoin.symbol
                    });
                }
            }
            
            this.coins = commonCoins;
            this.updateCoinCount();
            console.log(`${commonCoins.length}개의 공통 코인을 찾았습니다.`);
            
        } catch (error) {
            console.error('코인 목록 로드 실패:', error);
            // 실패 시 기본 코인 목록 사용
            this.coins = [
                {"upbit": "KRW-BTC", "bithumb": "BTC", "name": "비트코인", "symbol": "BTC"},
                {"upbit": "KRW-ETH", "bithumb": "ETH", "name": "이더리움", "symbol": "ETH"},
                {"upbit": "KRW-XRP", "bithumb": "XRP", "name": "리플", "symbol": "XRP"},
                {"upbit": "KRW-ADA", "bithumb": "ADA", "name": "에이다", "symbol": "ADA"},
                {"upbit": "KRW-DOT", "bithumb": "DOT", "name": "폴카닷", "symbol": "DOT"},
                {"upbit": "KRW-LINK", "bithumb": "LINK", "name": "체인링크", "symbol": "LINK"},
                {"upbit": "KRW-MATIC", "bithumb": "MATIC", "name": "폴리곤", "symbol": "MATIC"},
                {"upbit": "KRW-SOL", "bithumb": "SOL", "name": "솔라나", "symbol": "SOL"},
                {"upbit": "KRW-AVAX", "bithumb": "AVAX", "name": "아발란체", "symbol": "AVAX"},
                {"upbit": "KRW-DOGE", "bithumb": "DOGE", "name": "도지코인", "symbol": "DOGE"}
            ];
            this.updateCoinCount();
            this.showError(`코인 목록을 동적으로 가져올 수 없어 기본 목록을 사용합니다. (오류: ${error.message})`);
        } finally {
            this.isLoadingCoins = false;
            this.hideLoading();
        }
    }
    
    // 목업 데이터 생성 (API 실패 시 대비)
    generateMockData() {
        return this.coins.map(coin => {
            const basePrice = Math.random() * 100000 + 10000;
            const upbitPrice = basePrice + (Math.random() - 0.5) * 1000;
            const bithumbPrice = basePrice + (Math.random() - 0.5) * 1000;
            const kimchiPremium = (Math.random() - 0.5) * 10; // -5% ~ +5%
            
            return {
                coin,
                upbit: upbitPrice,
                bithumb: bithumbPrice,
                difference: bithumbPrice - upbitPrice,
                percentage: ((bithumbPrice - upbitPrice) / upbitPrice * 100),
                kimchiPremium
            };
        });
    }

    // 바이낸스 USDT 가격 가져오기 (심볼USDT)
    async fetchBinancePrices() {
        try {
            const binanceSymbols = this.coins.map(c => `${c.symbol}USDT`);
            // 중복 제거
            const uniqueSymbols = Array.from(new Set(binanceSymbols));
            const symbolsParam = encodeURIComponent(JSON.stringify(uniqueSymbols));
            const url = `https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('바이낸스 API 응답 오류');
            const data = await response.json();
            const map = new Map();
            for (const item of data) {
                // item: { symbol: 'BTCUSDT', price: '64200.12' }
                const symbol = item.symbol.replace('USDT', '');
                map.set(symbol, parseFloat(item.price));
            }
            return map; // symbol -> price in USD
        } catch (error) {
            console.error('바이낸스 가격 가져오기 실패:', error);
            return new Map();
        }
    }

    // USD->KRW 환율 가져오기
    async fetchUsdKrwRate() {
        try {
            const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=KRW');
            if (!response.ok) throw new Error('환율 API 응답 오류');
            const data = await response.json();
            const rate = data && data.rates && data.rates.KRW ? parseFloat(data.rates.KRW) : null;
            if (!rate) throw new Error('환율 데이터 없음');
            return rate;
        } catch (error) {
            console.error('환율 가져오기 실패:', error);
            return null;
        }
    }
    
    async fetchUpbitPrices() {
        const markets = this.coins.map(coin => coin.upbit).join(',');
        const url = `https://api.upbit.com/v1/ticker?markets=${markets}`;
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // API 키가 있으면 Authorization 헤더 추가
            if (this.apiKeys.upbit) {
                headers['Authorization'] = `Bearer ${this.apiKeys.upbit}`;
            }
            
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error('업비트 API 응답 오류');
            return await response.json();
        } catch (error) {
            console.error('업비트 API 오류:', error);
            throw error;
        }
    }
    
    async fetchBithumbPrices() {
        const promises = this.coins.map(async coin => {
            try {
                const url = `https://api.bithumb.com/public/ticker/${coin.bithumb}_KRW`;
                
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                // API 키가 있으면 추가 헤더 설정 (빗썸은 서명이 복잡하므로 현재는 공개 API 사용)
                if (this.apiKeys.bithumb) {
                    // 빗썸 API 키를 사용한 요청은 나중에 구현 가능
                    // 현재는 공개 API를 사용하되, 향후 확장 가능하도록 구조만 준비
                }
                
                const response = await fetch(url, { headers });
                if (!response.ok) throw new Error(`빗썸 ${coin.symbol} API 응답 오류`);
                const data = await response.json();
                return {
                    symbol: coin.bithumb,
                    price: parseFloat(data.data.closing_price)
                };
            } catch (error) {
                console.error(`빗썸 ${coin.symbol} API 오류:`, error);
                return {
                    symbol: coin.bithumb,
                    price: null
                };
            }
        });
        
        return await Promise.all(promises);
    }
    
    async fetchPrices() {
        this.showLoading();
        this.hideError();
        
        try {
            // API 실패 시 목업 데이터 사용
            if (this.useMockData) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
                this.priceData = this.generateMockData();
            } else {
                try {
                    const [upbitData, bithumbData, binanceMap, usdKrw] = await Promise.all([
                        this.fetchUpbitPrices(),
                        this.fetchBithumbPrices(),
                        this.fetchBinancePrices(),
                        this.fetchUsdKrwRate()
                    ]);
                    
                    this.priceData = this.processApiData(upbitData, bithumbData, binanceMap, usdKrw);
                } catch (apiError) {
                    console.warn('API 요청 실패, 목업 데이터 사용:', apiError);
                    this.useMockData = true;
                    this.priceData = this.generateMockData();
                    this.showError('실제 API 데이터를 가져올 수 없어 시뮬레이션 데이터를 표시합니다.');
                }
            }
            
            this.renderTable();
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('가격 데이터 가져오기 실패:', error);
            this.showError('가격 데이터를 가져오는데 실패했습니다.');
        } finally {
            this.hideLoading();
        }
    }
    
    processApiData(upbitData, bithumbData, binanceMap, usdKrw) {
        return this.coins.map(coin => {
            const upbitInfo = upbitData.find(item => item.market === coin.upbit);
            const bithumbInfo = bithumbData.find(item => item.symbol === coin.bithumb);
            
            const upbitPrice = upbitInfo ? upbitInfo.trade_price : null;
            const bithumbPrice = bithumbInfo ? bithumbInfo.price : null;
            const binanceUsd = binanceMap ? binanceMap.get(coin.symbol) : null;
            const binanceKrw = (binanceUsd && usdKrw) ? binanceUsd * usdKrw : null;
            
            if (!upbitPrice || !bithumbPrice) {
                return {
                    coin,
                    upbit: upbitPrice,
                    bithumb: bithumbPrice,
                    difference: null,
                    percentage: null,
                    kimchiPremium: (binanceKrw ? ((upbitPrice / binanceKrw - 1) * 100) : null),
                    error: true
                };
            }
            
            const difference = bithumbPrice - upbitPrice;
            const percentage = (difference / upbitPrice) * 100;
            const kimchiPremium = (binanceKrw ? ((upbitPrice / binanceKrw - 1) * 100) : null);
            
            return {
                coin,
                upbit: upbitPrice,
                bithumb: bithumbPrice,
                difference,
                percentage,
                kimchiPremium
            };
        });
    }
    
    sortData(data) {
        const sorted = [...data];
        
        switch (this.currentSort) {
            case 'percentage':
                return sorted.sort((a, b) => Math.abs(b.percentage || 0) - Math.abs(a.percentage || 0));
            case 'kimchi':
                return sorted.sort((a, b) => Math.abs((b.kimchiPremium || 0)) - Math.abs((a.kimchiPremium || 0)));
            default:
                return sorted.sort((a, b) => a.coin.name.localeCompare(b.coin.name));
        }
    }

    // 모바일에서 정렬 기준에 따라 컬럼 표시/숨김
    updateTableColumns() {
        const table = document.getElementById('priceTable');
        const tableContainer = document.querySelector('.table-container');
        if (!table || !tableContainer) return;
        
        // 모든 컬럼 클래스 제거
        table.classList.remove('show-percentage', 'show-kimchi', 'show-all-columns');
        tableContainer.classList.remove('show-all-columns');
        
        // 모바일에서만 적용 (768px 이하)
        if (window.innerWidth <= 768) {
            switch (this.currentSort) {
                case 'percentage':
                    table.classList.add('show-percentage');
                    break;
                case 'kimchi':
                    table.classList.add('show-kimchi');
                    break;
                default:
                    // 기본값(코인명)일 때는 모든 컬럼 표시하고 가로 슬라이딩
                    table.classList.add('show-all-columns');
                    tableContainer.classList.add('show-all-columns');
                    break;
            }
        }
    }

    renderTable() {
        const tbody = document.getElementById('priceTableBody');
        const table = document.getElementById('priceTable');
        if (!tbody || !table) return;
        
        const sortedData = this.sortData(this.priceData);
        
        // 모바일에서 정렬 기준에 따라 컬럼 표시/숨김
        this.updateTableColumns();
        
        tbody.innerHTML = sortedData.map(item => {
            if (item.error) {
                return `
                    <tr>
                        <td>
                            <div class="coin-info">
                                <div>
                                    <div>${item.coin.name}</div>
                                    <div class="coin-symbol">${item.coin.symbol}</div>
                                </div>
                            </div>
                        </td>
                        <td class="price-upbit">${item.upbit ? this.formatPrice(item.upbit) : 'N/A'}</td>
                        <td class="price-bithumb">${item.bithumb ? this.formatPrice(item.bithumb) : 'N/A'}</td>
                        <td class="percentage-col"><span class="percentage-value">N/A</span></td>
                        <td class="kimchi-col"><span class="kimchi-value">N/A</span></td>
                        <td class="advantage-col"><span class="advantage">N/A</span></td>
                    </tr>
                `;
            }
            
            const higherPrice = item.bithumb > item.upbit ? 'bithumb' : 'upbit';
            const percentageClass = item.percentage > 0 ? 'percentage--positive' : 'percentage--negative';
            const kimchiClass = (item.kimchiPremium || 0) > 0 ? 'percentage--positive' : 'percentage--negative';
            
            // 유리한 거래소 결정 (더 저렴한 쪽이 유리)
            const advantageExchange = item.bithumb < item.upbit ? 'bithumb' : 'upbit';
            const advantageClass = advantageExchange === 'upbit' ? 'advantage--upbit' : 'advantage--bithumb';
            const advantageText = advantageExchange === 'upbit' ? '업비트' : '빗썸';
            
            return `
                <tr>
                    <td>
                        <div class="coin-info">
                            <div>
                                <div>${item.coin.name}</div>
                                <div class="coin-symbol">${item.coin.symbol}</div>
                            </div>
                        </div>
                    </td>
                    <td class="price price-upbit ${higherPrice === 'upbit' ? 'higher-price' : ''}">${this.formatPrice(item.upbit)}</td>
                    <td class="price price-bithumb ${higherPrice === 'bithumb' ? 'higher-price' : ''}">${this.formatPrice(item.bithumb)}</td>
                    <td class="percentage-col"><span class="percentage-value ${percentageClass}">${this.formatPercentage(item.percentage)}</span></td>
                    <td class="kimchi-col"><span class="kimchi-value ${kimchiClass}">${this.formatKimchiPremium(item.kimchiPremium)}</span></td>
                    <td class="advantage-col"><span class="advantage ${advantageClass}">${advantageText}</span></td>
                </tr>
            `;
        }).join('');
    }
    
    formatPrice(price) {
        if (price === null || price === undefined) return 'N/A';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }
    
    
    formatPercentage(percentage) {
        if (percentage === null || percentage === undefined) return 'N/A';
        const prefix = percentage > 0 ? '+' : '';
        return prefix + percentage.toFixed(2) + '%';
    }

    // 김치 프리미엄 전용 포맷터 (퍼센트로 확실히 표시)
    formatKimchiPremium(percentage) {
        if (percentage === null || percentage === undefined) return 'N/A';
        const prefix = percentage > 0 ? '+' : '';
        console.log('김치 프리미엄 포맷팅:', percentage, '→', prefix + percentage.toFixed(2) + '%');
        return prefix + percentage.toFixed(2) + '%';
    }
    
    updateLastUpdateTime() {
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleString('ko-KR');
        }
    }

    updateCoinCount() {
        const coinCountEl = document.getElementById('coinCount');
        if (coinCountEl) {
            coinCountEl.textContent = this.coins.length;
        }
    }
    
    showLoading() {
        const loadingEl = document.getElementById('loadingOverlay');
        if (loadingEl) {
            loadingEl.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loadingEl = document.getElementById('loadingOverlay');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
    
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        const errorTextEl = document.getElementById('errorText');
        if (errorEl && errorTextEl) {
            errorTextEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    }
    
    hideError() {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.classList.add('hidden');
        }
    }
    
    startAutoUpdate() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = setInterval(() => {
            this.fetchPrices();
        }, this.updateInterval);
    }
    
    stopAutoUpdate() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// DOM이 로드되면 애플리케이션 시작
document.addEventListener('DOMContentLoaded', async () => {
    window.priceComparator = new CryptoPriceComparator();
});

// API 키 섹션 토글 함수
window.toggleApiKeys = function() {
    const content = document.getElementById('apiKeysContent');
    const toggle = document.getElementById('apiKeysToggle');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▲';
    } else {
        content.style.display = 'none';
        toggle.textContent = '▼';
    }
};

// 페이지를 떠날 때 자동 업데이트 정리
window.addEventListener('beforeunload', () => {
    if (window.priceComparator) {
        window.priceComparator.stopAutoUpdate();
    }
});