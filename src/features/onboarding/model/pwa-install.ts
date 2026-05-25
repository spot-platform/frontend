export type PwaInstallPlatform =
    | 'ios-safari'
    | 'android-chrome'
    | 'desktop'
    | 'generic';

export type PwaInstallGuide = {
    platform: PwaInstallPlatform;
    title: string;
    steps: string[];
};

export const PWA_SHORTCUTS = [
    {
        label: '지도 바로 열기',
        description: '현재 주변 스팟과 피드 카드덱을 바로 확인해요.',
        url: '/map',
    },
    {
        label: '나눔 올리기',
        description: '남는 자리나 자원을 빠르게 공유해요.',
        url: '/post/offer',
    },
    {
        label: '채팅 확인',
        description: '매칭된 팀/개인 채팅으로 곧장 이동해요.',
        url: '/chat',
    },
] as const;

export function detectPwaInstallPlatform(
    userAgent: string,
): PwaInstallPlatform {
    const normalized = userAgent.toLowerCase();
    const isIOS =
        /iphone|ipad|ipod/.test(normalized) ||
        (normalized.includes('macintosh') && normalized.includes('mobile'));
    const isAndroid = normalized.includes('android');
    const isChromium = /chrome|crios|edg|samsungbrowser/.test(normalized);

    if (isIOS) return 'ios-safari';
    if (isAndroid && isChromium) return 'android-chrome';
    if (/macintosh|windows|linux|cros/.test(normalized)) return 'desktop';
    return 'generic';
}

export function getPwaInstallGuide(
    platform: PwaInstallPlatform,
): PwaInstallGuide {
    switch (platform) {
        case 'ios-safari':
            return {
                platform,
                title: 'iPhone Safari에서 설치하기',
                steps: [
                    '하단 공유 버튼을 눌러요.',
                    '홈 화면에 추가를 선택해요.',
                    '추가를 누르면 Spot이 앱처럼 열려요.',
                ],
            };
        case 'android-chrome':
            return {
                platform,
                title: 'Android Chrome에서 설치하기',
                steps: [
                    '주소창 또는 메뉴의 설치 버튼을 찾아요.',
                    '앱 설치를 누르고 확인해요.',
                    '홈 화면의 Spot 아이콘으로 다시 들어와요.',
                ],
            };
        case 'desktop':
            return {
                platform,
                title: 'PC 브라우저에서 설치하기',
                steps: [
                    '주소창 오른쪽의 설치 아이콘을 눌러요.',
                    '설치를 확인하면 독립 창으로 열려요.',
                    '작업 표시줄이나 Dock에 고정해두면 빨라요.',
                ],
            };
        default:
            return {
                platform,
                title: '브라우저에서 설치하기',
                steps: [
                    '브라우저 메뉴를 열어요.',
                    '앱 설치 또는 홈 화면에 추가를 선택해요.',
                    '설치 후 Spot 아이콘으로 바로 시작해요.',
                ],
            };
    }
}

export function isStandaloneDisplay(
    displayMode: string,
    navigatorStandalone?: boolean,
) {
    return displayMode === 'standalone' || Boolean(navigatorStandalone);
}
