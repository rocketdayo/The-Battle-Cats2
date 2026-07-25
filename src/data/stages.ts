import { StageData } from '../types';

// Landmarks and themes for each chapter to generate 50 rich stages per chapter
const CHAPTER_1_LANDMARKS = [
  '秋葉原電気街', '富士山麓関所', '京都金閣寺', '博多中洲屋台街', '富士山頂防衛線',
  '広島安芸宮島', '札幌時計台雪原', '沖縄首里城跡', '名古屋城天守閣', '大阪道頓堀通',
  '日光東照宮陽明門', '仙台青葉城址', '箱根関所温泉街', '出雲大社鳥居前', '阿蘇山火口陣地',
  '横浜中華街大通り', '神戸港ハーバータワー', '伊勢神宮参道', '奈良公園大仏殿', '金沢兼六園雪吊り',
  '松本城天守', '高山古い町並み', '富山立山黒部アルペン', '長崎グラバー園', '熊本城武者返し',
  '別府地獄めぐり', '松山道後温泉', '高知桂浜龍馬像', '徳島鳴門渦潮前', '高松栗林公園',
  '鳥取砂丘要塞', '島根松江城', '岡山後楽園', '倉敷美観地区', '姫路城白鷺城', '滋賀琵琶湖竹生島',
  '和歌山高野山壇上', '青森弘前城桜門', '秋田角館武家屋敷', '岩手平泉中尊寺', '山形蔵王樹氷林',
  '福島会津若松鶴ヶ城', '茨城大洗磯前神社', '栃木那須高原砦', '群馬草津湯畑', '埼玉川越時の鐘',
  '千葉成田山新勝寺', '東京スカイツリー前', '東京タワー決戦場', '富士山超極秘にゃんこ要塞'
];

const CHAPTER_2_LANDMARKS = [
  '月面基地アルテミス', '水星灼熱クレーター', '金星硫酸雲コロニー', '火星オリンポス山基地', '木星エウロパ氷海',
  '土星タイタン窒素湖', '天王星極寒リング', '海王星トリトン前線', '冥王星氷結晶要塞', 'アルファ・ケンタウリα',
  'シリウス青色巨星', 'ベテルギウス赤色超巨星', 'プロキオン光芒宇宙港', 'ベガ織姫星ドーム', 'アルタイル彦星要塞',
  'デネブ白鳥座ゲート', 'プレアデスすばる星団', 'オリオン大星雲ドーム', 'アンドロメダ銀河腕', 'マゼラン雲星系要塞',
  'ヘリックスらせん星雲', 'キャッツアイ星雲', 'かに星雲超新星残骸', '馬頭星雲暗黒空間', 'わし星雲創造の柱',
  'オメガ星雲', 'リング星雲環状基地', 'タランチュラ星雲', 'バラ星雲宇宙花園', 'バタフライ星雲',
  '銀河系第1腕アーム', '銀河系第2腕アーム', '銀河系中心ブラックホール域', 'クエーサー極大放射波', 'ガンマ線バースト前線',
  'ダークマター超空間', 'ワームホール時空洞', '超弦理論11次元回廊', 'マルチバース境界線', '量子もつれ空間',
  'イベントホライズン事象', 'シュヴァルツシルト半径', 'タキオン超光速領域', '重力波天体コリジョン', '宇宙マイクロ波背景放射',
  'ビッグバン名残の光', '宇宙紐 cosmic string', '暗黒エネルギー濃縮プラント', '超銀河団ラニアケア', '銀河中心ブラックホールコア'
];

const CHAPTER_3_LANDMARKS = [
  'ヴァルハラ英雄殿', 'オリンポス十二神殿', '高天原天の浮橋', 'アースガルズ虹の橋', 'シャンバラ理想郷宮',
  'アトランティス海底神殿', 'エルドラド黄金都市', 'ユグドラシル世界樹幹', 'アヴァロン霧の聖島', 'タケミカヅチ雷鳴殿',
  'ゼウス天空の玉座', 'ポセイドン荒天海域', 'ハーデス冥府の門', 'オーディンルーン神殿', 'トール神雷撃陣',
  'ロキ幻影迷宮', 'アマテラス天岩戸前', 'スサノオ八岐大蛇砦', 'ツクヨミ月読宮', 'イザナギ創世の丘',
  'アテナ知恵の聖堂', 'アポロン太陽の戦車', 'アルテミス月光の射場', 'ヘルメス神速の回廊', 'アレス闘争の闘技場',
  'ヘパイストス鍛冶神殿', 'ディオニュソス狂乱殿', 'ペルセポネ冥界の庭', 'クロノス時空神殿', 'ウラノス星空の天井',
  'ガイア大地の大母神殿', 'カオス混沌の源流', 'ニュクス夜の帳', 'エレボス暗黒底', 'タルタロス無間地獄',
  'エリュシオン極楽浄土', 'ネメシス報復の天秤', 'モイライ運命の糸車', 'フェニックス不滅の祭壇', 'レヴィアタン深淵門',
  'バハムート創世の巨躯', 'ルシファー堕天の玉座', 'ミカエル聖剣の陣', 'ガブリエル神託の塔', 'ウリエル断罪の炎',
  'ラファエル癒やしの泉', 'メタトロン契約の立方体', 'オメガアルファ境界殿', 'アカシックレコード全知殿', '神創主ゼウス・オメガ殿'
];

// Helper to generate 50 stages per chapter
function generate50Stages(
  chapterId: number,
  chapterName: string,
  landmarks: string[],
  baseCastleHp: number,
  baseEnergy: number,
  bgColors: [string, string][],
  groundColors: string[]
): StageData[] {
  const stages: StageData[] = [];

  for (let i = 0; i < 50; i++) {
    const stageNum = i + 1;
    const isBossStage = stageNum % 10 === 0 || stageNum === 50;
    const isMidBoss = stageNum % 5 === 0 && !isBossStage;
    const landmark = landmarks[i] || `要塞ポイント No.${stageNum}`;

    // Calculate scaling difficulties
    const stageHpScale = Math.floor(baseCastleHp * (1 + (i * 0.18) + (i * i * 0.005)));
    const energyCost = Math.min(100, Math.floor(baseEnergy + (i * 0.8)));

    // Choose Enemy composition
    const enemySpawns = [];
    
    // Wave 1: Always early basic enemies
    enemySpawns.push({
      enemyId: 'e_puppy',
      spawnTimeSeconds: 1,
      repeatIntervalSeconds: Math.max(2, 6 - Math.floor(i / 10)),
      waveName: `第一陣: 先頭スカウト兵`,
    });

    if (i >= 2) {
      enemySpawns.push({
        enemyId: 'e_piggy',
        spawnTimeSeconds: 4,
        repeatIntervalSeconds: Math.max(4, 10 - Math.floor(i / 8)),
        waveName: `第二陣: 突進ブヒ兵`,
      });
    }

    if (i >= 5) {
      enemySpawns.push({
        enemyId: 'e_gorilla',
        spawnTimeSeconds: 8,
        repeatIntervalSeconds: Math.max(8, 18 - Math.floor(i / 6)),
        waveName: `第三陣: 重装メカゴリラ`,
      });
    }

    if (i >= 12 || chapterId >= 2) {
      enemySpawns.push({
        enemyId: 'e_alien_ufo',
        spawnTimeSeconds: 12,
        repeatIntervalSeconds: Math.max(10, 22 - Math.floor(i / 5)),
        waveName: `第四陣: エイリアンUFO隊`,
      });
    }

    if (isBossStage || i >= 20 || chapterId === 3) {
      enemySpawns.push({
        enemyId: 'e_dragon_boss',
        spawnTimeSeconds: isBossStage ? 2 : 20,
        castleHpPercentTrigger: isBossStage ? 80 : 40,
        repeatIntervalSeconds: isBossStage ? 35 : 50,
        waveName: isBossStage ? `⚠️ 超大型ボス強臨！！` : `強敵ドラゴン参戦`,
      });
    }

    const bgIdx = i % bgColors.length;
    const bgGradient = bgColors[bgIdx];
    const groundColor = groundColors[i % groundColors.length];

    stages.push({
      id: `stage_${chapterId}_${stageNum}`,
      chapterId,
      chapterName,
      stageNumber: stageNum,
      name: landmark,
      description: isBossStage
        ? `【大ボス関門】${landmark}を守護する強大な敵軍！全戦力を投入して打ち破れ！`
        : isMidBoss
        ? `【中ボス精鋭陣】${landmark}に敵の強豪部隊が結集。油断は禁物だ！`
        : `${landmark}でのバトル。進軍して敵城を制圧しよう！`,
      energyCost,
      enemyCastleHp: stageHpScale,
      playerCastleHp: Math.floor(3000 + i * 200),
      castleColor: chapterId === 1 ? '#38bdf8' : chapterId === 2 ? '#a855f7' : '#eab308',
      enemySpawns,
      firstClearRewardCatFood: isBossStage ? 100 : isMidBoss ? 50 : 20 + (stageNum % 5) * 5,
      firstClearRewardXp: Math.floor(1000 + i * 800 + (isBossStage ? 10000 : 0)),
      bgGradient,
      groundColor,
    });
  }

  return stages;
}

// Chapter 1 Colors (Japan Earthly tones & sunsets)
const CH1_BG: [string, string][] = [
  ['#e0f2fe', '#bae6fd'],
  ['#fef3c7', '#fde047'],
  ['#fed7aa', '#f97316'],
  ['#fef08a', '#eab308'],
  ['#e2e8f0', '#94a3b8'],
  ['#ffedd5', '#fdba74'],
  ['#fae8ff', '#e9d5ff'],
];
const CH1_GROUND = ['#475569', '#166534', '#78350f', '#854d0e', '#334155', '#9a3412', '#581c87'];

// Chapter 2 Colors (Deep Outer Space & Galaxies)
const CH2_BG: [string, string][] = [
  ['#0284c7', '#0f172a'],
  ['#581c87', '#020617'],
  ['#3b0764', '#09090b'],
  ['#1e1b4b', '#030712'],
  ['#701a75', '#111827'],
  ['#172554', '#020617'],
];
const CH2_GROUND = ['#1e293b', '#312e81', '#4c1d95', '#500724', '#0284c7', '#15803d'];

// Chapter 3 Colors (Divine Heavens & Holy Realms)
const CH3_BG: [string, string][] = [
  ['#fef08a', '#ca8a04'],
  ['#fed7aa', '#ea580c'],
  ['#f472b6', '#831843'],
  ['#38bdf8', '#1e3a8a'],
  ['#a7f3d0', '#065f46'],
  ['#fef3c7', '#b45309'],
];
const CH3_GROUND = ['#854d0e', '#701a75', '#1e3a8a', '#065f46', '#9a3412', '#3f6212'];

// Secret Impossible Stage for Chapter 1 Completion
export const SECRET_STAGE_1: StageData = {
  id: 'stage_1_secret',
  chapterId: 1,
  chapterName: '第1章: 日本全国制覇編',
  stageNumber: 51,
  name: 'ステージ？？？ 【異次元超絶極悪要塞】',
  description: '【⚠️第1章裏ボス・絶望的難易度】第1章コンプリートで突如出現した次元の歪み。城HP1,000,000、古代神龍＆極悪ブヒ兵軍団が秒速で押し寄せる！勝利できる者は存在するのか…！？',
  energyCost: 99,
  enemyCastleHp: 1000000,
  playerCastleHp: 20000,
  castleColor: '#dc2626',
  enemySpawns: [
    {
      enemyId: 'e_gorilla',
      spawnTimeSeconds: 1,
      repeatIntervalSeconds: 3,
      waveName: '⚠️第一陣: 強撃メカゴリラ軍団猛攻',
    },
    {
      enemyId: 'e_alien_ufo',
      spawnTimeSeconds: 2,
      repeatIntervalSeconds: 4,
      waveName: '⚠️第二陣: エイリアンUFO爆撃部隊',
    },
    {
      enemyId: 'e_dragon_boss',
      spawnTimeSeconds: 3,
      castleHpPercentTrigger: 99,
      repeatIntervalSeconds: 15,
      waveName: '💀【超極限裏ボス】古代壊滅神龍・即降臨！！',
    },
    {
      enemyId: 'e_piggy',
      spawnTimeSeconds: 5,
      repeatIntervalSeconds: 2,
      waveName: '⚠️第三陣: 突撃光速ブヒ兵突入',
    },
  ],
  firstClearRewardCatFood: 5000,
  firstClearRewardXp: 1000000,
  bgGradient: ['#450a0a', '#020617'],
  groundColor: '#7f1d1d',
  isSecretStage: true,
};

// Secret Impossible Stage for Chapter 2 Completion
export const SECRET_STAGE_2: StageData = {
  id: 'stage_2_secret',
  chapterId: 2,
  chapterName: '第2章: 太陽系＆銀河宇宙攻略編',
  stageNumber: 51,
  name: 'ステージ？？？ 【銀河終焉ブラックホール】',
  description: '【⚠️第2章裏ボス・絶対絶望領域】第2章コンプリートで出現した銀河最果ての特異点。城HP5,000,000、宇宙最高位エイリアン皇帝と壊滅龍の無限湧き！世界の崩壊を防げるか！？',
  energyCost: 150,
  enemyCastleHp: 5000000,
  playerCastleHp: 50000,
  castleColor: '#581c87',
  enemySpawns: [
    {
      enemyId: 'e_alien_ufo',
      spawnTimeSeconds: 1,
      repeatIntervalSeconds: 2,
      waveName: '⚠️第一陣: 侵略型エイリアンUFO大群',
    },
    {
      enemyId: 'e_gorilla',
      spawnTimeSeconds: 2,
      repeatIntervalSeconds: 3,
      waveName: '⚠️第二陣: 滅亡級サイバーゴリラ部隊',
    },
    {
      enemyId: 'e_dragon_boss',
      spawnTimeSeconds: 3,
      castleHpPercentTrigger: 99,
      repeatIntervalSeconds: 10,
      waveName: '💀【第2章裏ボス】銀河破壊神・降臨！！',
    },
  ],
  firstClearRewardCatFood: 10000,
  firstClearRewardXp: 5000000,
  bgGradient: ['#3b0764', '#020617'],
  groundColor: '#4c1d95',
  isSecretStage: true,
};

// Secret Impossible Stage for Chapter 3 Completion
export const SECRET_STAGE_3: StageData = {
  id: 'stage_3_secret',
  chapterId: 3,
  chapterName: '第3章: 神界創世＆次元侵略編',
  stageNumber: 51,
  name: 'ステージ？？？ 【神界滅亡オリジン・零】',
  description: '【⚠️全ゲーム最高峰難易度・終焉の神域】全宇宙の理を超越した絶対神の真の姿。城HP20,000,000、壊滅龍＆極悪ボス軍団がミリ秒単位で押し寄せる超次元バトル！',
  energyCost: 200,
  enemyCastleHp: 20000000,
  playerCastleHp: 100000,
  castleColor: '#9f1239',
  enemySpawns: [
    {
      enemyId: 'e_dragon_boss',
      spawnTimeSeconds: 1,
      repeatIntervalSeconds: 8,
      waveName: '💀【終焉裏ボス】壊滅神龍・即時怒涛降臨！',
    },
    {
      enemyId: 'e_alien_ufo',
      spawnTimeSeconds: 2,
      repeatIntervalSeconds: 2,
      waveName: '⚠️第二陣: 次元消滅UFO特攻隊',
    },
    {
      enemyId: 'e_gorilla',
      spawnTimeSeconds: 3,
      repeatIntervalSeconds: 2,
      waveName: '⚠️第三陣: 装甲神威ゴリラ突撃',
    },
  ],
  firstClearRewardCatFood: 30000,
  firstClearRewardXp: 20000000,
  bgGradient: ['#881337', '#020617'],
  groundColor: '#991b1b',
  isSecretStage: true,
};

// Export complete 150 Stages (50 for Ch1, 50 for Ch2, 50 for Ch3) + 3 Secret Stages
export const STAGES: StageData[] = [
  ...generate50Stages(1, '第1章: 日本全国制覇編', CHAPTER_1_LANDMARKS, 1200, 10, CH1_BG, CH1_GROUND),
  SECRET_STAGE_1,
  ...generate50Stages(2, '第2章: 太陽系＆銀河宇宙攻略編', CHAPTER_2_LANDMARKS, 25000, 30, CH2_BG, CH2_GROUND),
  SECRET_STAGE_2,
  ...generate50Stages(3, '第3章: 神界創世＆次元侵略編', CHAPTER_3_LANDMARKS, 100000, 50, CH3_BG, CH3_GROUND),
  SECRET_STAGE_3,
];
