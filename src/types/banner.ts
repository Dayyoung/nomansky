export interface MilestoneBannerData {
  id: number;
  category: string; // e.g., '성간 탐험 // MILESTONE', '행성 발견 // PLANET DISCOVERED'
  title: string;    // e.g., '새로운 별들의 고향', '보이드 마더의 요람'
  subTitle: string; // e.g., '유클리드 은하계 진입 기록 갱신', '극저온 생물군계 100% 스캔 달성'
  rank?: string;    // e.g., 'RANK: PIONEER', 'LEVEL 10 // ATLAS'
  color?: string;   // Accent hex
  durationMs?: number;
}
