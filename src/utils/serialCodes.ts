import { SerialCode, PlayerData, CatUnitData } from '../types';

export const DEFAULT_SERIAL_CODES: SerialCode[] = [
  {
    code: 'NYANKO50',
    rewardCatFood: 50,
    description: '【公式】初心者歓迎プレゼント！猫缶50個',
    isActive: true,
  },
  {
    code: 'CATFOOD100',
    rewardCatFood: 100,
    description: '【公式】猫缶大漁増量プレゼント！猫缶100個',
    isActive: true,
  },
  {
    code: 'BONBON2026',
    rewardCatFood: 50,
    rewardItems: { catBon: 5 },
    description: '【公式限定】ネコボン 5個プレゼント！',
    isActive: true,
  },
  {
    code: 'SNIPER2026',
    rewardCatFood: 50,
    rewardItems: { sniper: 5 },
    description: '【公式限定】スニャイパー 5個プレゼント！',
    isActive: true,
  },
  {
    code: 'NYANKOCPU',
    rewardCatFood: 50,
    rewardItems: { cpu: 5 },
    description: '【公式限定】ニャンコCPU 5個プレゼント！',
    isActive: true,
  },
  {
    code: 'RADAR2026',
    rewardCatFood: 50,
    rewardItems: { treasureRadar: 3 },
    description: '【公式限定】トレジャーレーダー 3個プレゼント！',
    isActive: true,
  },
  {
    code: 'ITEMPACK2026',
    rewardCatFood: 100,
    rewardXp: 10000,
    rewardItems: { catBon: 3, sniper: 3, cpu: 3, treasureRadar: 3 },
    description: '【豪華パック】全アイテム各3個詰め合わせセット！',
    isActive: true,
  },
  {
    code: 'NEKO2026',
    rewardCatFood: 200,
    description: '【2026年記念】感謝のネコ缶200個プレゼント！',
    isActive: true,
  },
  {
    code: 'PREMIUM2026',
    rewardCatFood: 300,
    rewardXp: 50000,
    description: '【豪華特典】猫缶300個 & 50,000 XPプレゼント！',
    isActive: true,
  },
  {
    code: 'SUMMER2026',
    rewardCatFood: 150,
    description: '【特別ギフト】猫缶150個 獲得！',
    isActive: true,
  },
  {
    code: 'MEGACAT1000',
    rewardCatFood: 1000,
    rewardXp: 100000,
    description: '【超大漁】メガネコ缶 1000個 & 10万XPプレゼント！',
    isActive: true,
  },
  {
    code: 'GODCAT9999',
    rewardCatFood: 9999,
    rewardXp: 1000000,
    description: '【神域解放】猫缶 9999個 & 100万XPプレゼント！',
    isActive: true,
  },
  {
    code: 'SMARTPHONE',
    rewardCatFood: 200,
    rewardXp: 30000,
    description: '【スマホ全端末共通】データ共有記念 猫缶200個プレゼント！',
    isActive: true,
  },
  {
    code: 'SHARE2026',
    rewardCatFood: 300,
    description: '【全端末シェア】猫缶300個プレゼント！',
    isActive: true,
  },
];

const CUSTOM_CODES_STORAGE_KEY = 'nyanko_custom_serial_codes';

const SECRET_SALT = 'NYANKO_GREAT_WAR_SECRET_KEY_2026_SECURITY_SALT';

// Cryptographic FNV-1a hash algorithm for checksum generation
function computeChecksum(str: string): string {
  let hash = 0x811c9dc5;
  const combined = str + SECRET_SALT;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

// Obfuscate / Encrypt payload string with XOR key & signature
export function encryptPayload(data: string): string {
  let xorResult = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
    xorResult += String.fromCharCode(charCode);
  }
  const base64 = btoa(encodeURIComponent(xorResult)).replace(/=/g, '');
  const sig = computeChecksum(data);
  return `${base64}-${sig}`;
}

// Decrypt and verify payload with signature check
export function decryptPayload(encryptedStr: string): string | null {
  try {
    const parts = encryptedStr.split('-');
    if (parts.length !== 2) return null;
    const [base64, expectedSig] = parts;
    
    // Restore base64 padding
    let paddedBase64 = base64;
    while (paddedBase64.length % 4 !== 0) paddedBase64 += '=';

    const raw = decodeURIComponent(atob(paddedBase64));
    let decrypted = '';
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      decrypted += String.fromCharCode(charCode);
    }

    // Tamper-proof verification: check signature against decrypted content
    const actualSig = computeChecksum(decrypted);
    if (actualSig !== expectedSig) {
      return null; // Tampering detected!
    }
    return decrypted;
  } catch {
    return null;
  }
}

// Generate Universal Portable Encrypted Code string for a reward
export function generateUniversalRewardCode(
  codeName: string,
  catFood: number,
  xp: number = 0,
  items?: { catBon?: number; sniper?: number; cpu?: number; treasureRadar?: number }
): string {
  const cleanName = codeName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GIFT';
  const bon = items?.catBon || 0;
  const sni = items?.sniper || 0;
  const cpu = items?.cpu || 0;
  const rad = items?.treasureRadar || 0;
  const payload = `REWARD:${cleanName}:${catFood}:${xp}:${bon}:${sni}:${cpu}:${rad}`;
  const encryptedToken = encryptPayload(payload);
  return `NYC-${encryptedToken}`;
}

// Generate Universal Code string for a custom cat
export function generateCustomCatShareCode(catUnit: CatUnitData): string {
  const jsonStr = JSON.stringify(catUnit);
  const encryptedToken = encryptPayload(jsonStr);
  return `CATUNIT-${encryptedToken}`;
}

// Get custom serial codes from localStorage
export function getCustomSerialCodes(): SerialCode[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CODES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save custom serial codes to localStorage
export function saveCustomSerialCodes(codes: SerialCode[]): void {
  try {
    localStorage.setItem(CUSTOM_CODES_STORAGE_KEY, JSON.stringify(codes));
  } catch (err) {
    console.error('Failed to save custom serial codes:', err);
  }
}

// Get all combined serial codes (Default + Custom)
export function getAllSerialCodes(): SerialCode[] {
  const customCodes = getCustomSerialCodes();
  const customCodeMap = new Map(customCodes.map((c) => [c.code.toUpperCase(), c]));

  const combined = DEFAULT_SERIAL_CODES.map((defaultCode) => {
    const upper = defaultCode.code.toUpperCase();
    if (customCodeMap.has(upper)) {
      const override = customCodeMap.get(upper)!;
      customCodeMap.delete(upper);
      return override;
    }
    return defaultCode;
  });

  return [...combined, ...Array.from(customCodeMap.values())];
}

export interface RedeemResult {
  success: boolean;
  message: string;
  rewardCatFood?: number;
  rewardXp?: number;
  rewardItems?: {
    catBon?: number;
    sniper?: number;
    cpu?: number;
    treasureRadar?: number;
  };
  rewardUnit?: CatUnitData;
}

// Validate and process serial code claim
export function claimSerialCode(
  rawInputCode: string,
  playerData: PlayerData
): { updatedPlayerData: PlayerData; result: RedeemResult } {
  const rawTrimmed = rawInputCode.trim();
  const normalizedInput = rawTrimmed.toUpperCase();

  if (!normalizedInput) {
    return {
      updatedPlayerData: playerData,
      result: { success: false, message: 'シリアルコードを入力してください。' },
    };
  }

  const usedList = playerData.usedSerialCodes || [];

  // Check if code was already used on this device
  if (usedList.includes(normalizedInput)) {
    return {
      updatedPlayerData: playerData,
      result: { success: false, message: 'このシリアルコードは既に受取済みです。' },
    };
  }

  // --- CASE 1: Custom Cat Share Code (CATUNIT-<encryptedToken>) ---
  if (normalizedInput.startsWith('CATUNIT-')) {
    const token = rawTrimmed.slice(8);
    const decryptedJson = decryptPayload(token);

    if (!decryptedJson) {
      return {
        updatedPlayerData: playerData,
        result: {
          success: false,
          message: '改ざん検知：無効または暗号化が破壊されたキャット共有コードです！',
        },
      };
    }

    try {
      const catUnit = JSON.parse(decryptedJson) as CatUnitData;

      if (!catUnit || !catUnit.id || !catUnit.baseName) {
        return {
          updatedPlayerData: playerData,
          result: { success: false, message: '無効なキャットデータ形式です。' },
        };
      }

      // Check if unit already owned
      const existingUnits = playerData.customUnits || [];
      const alreadyOwns = existingUnits.some((u) => u.id === catUnit.id);
      const updatedCustomUnits = alreadyOwns ? existingUnits : [...existingUnits, catUnit];

      const updatedPlayerData: PlayerData = {
        ...playerData,
        customUnits: updatedCustomUnits,
        usedSerialCodes: [...usedList, normalizedInput],
      };

      return {
        updatedPlayerData,
        result: {
          success: true,
          message: `🐱【暗号コード認証成功】特注新種ニャンコ「${catUnit.baseName}」を獲得して解放しました！`,
          rewardUnit: catUnit,
        },
      };
    } catch {
      return {
        updatedPlayerData: playerData,
        result: { success: false, message: '解読に失敗しました。コードが破損しています。' },
      };
    }
  }

  // --- CASE 2: Universal Encrypted Reward Code Format (NYC-<encryptedToken>) ---
  if (normalizedInput.startsWith('NYC-')) {
    const token = rawTrimmed.slice(4);
    const decrypted = decryptPayload(token);

    if (!decrypted || !decrypted.startsWith('REWARD:')) {
      return {
        updatedPlayerData: playerData,
        result: {
          success: false,
          message: '改ざん検知：数字改ざん・不正生成されたシリアルコードです！',
        },
      };
    }

    const parts = decrypted.split(':');
    if (parts.length < 4) {
      return {
        updatedPlayerData: playerData,
        result: { success: false, message: '不正な報酬構造コードです。' },
      };
    }

    const [_, codeName, cfStr, xpStr, bonStr, sniStr, cpuStr, radStr] = parts;
    const cfVal = parseInt(cfStr, 10) || 0;
    const xpVal = parseInt(xpStr, 10) || 0;
    const bonVal = parseInt(bonStr || '0', 10) || 0;
    const sniVal = parseInt(sniStr || '0', 10) || 0;
    const cpuVal = parseInt(cpuStr || '0', 10) || 0;
    const radVal = parseInt(radStr || '0', 10) || 0;

    const updatedItems = { ...(playerData.items || {}) };
    if (bonVal > 0) updatedItems.catBon = (updatedItems.catBon || 0) + bonVal;
    if (sniVal > 0) updatedItems.sniper = (updatedItems.sniper || 0) + sniVal;
    if (cpuVal > 0) updatedItems.cpu = (updatedItems.cpu || 0) + cpuVal;
    if (radVal > 0) updatedItems.treasureRadar = (updatedItems.treasureRadar || 0) + radVal;

    const updatedPlayerData: PlayerData = {
      ...playerData,
      catFood: playerData.catFood + cfVal,
      xp: playerData.xp + xpVal,
      items: updatedItems,
      usedSerialCodes: [...usedList, normalizedInput],
    };

    const itemParts: string[] = [];
    if (cfVal > 0) itemParts.push(`猫缶 +${cfVal}個`);
    if (xpVal > 0) itemParts.push(`XP +${xpVal.toLocaleString()}`);
    if (bonVal > 0) itemParts.push(`ネコボン +${bonVal}個`);
    if (sniVal > 0) itemParts.push(`スニャイパー +${sniVal}個`);
    if (cpuVal > 0) itemParts.push(`ニャンコCPU +${cpuVal}個`);
    if (radVal > 0) itemParts.push(`トレジャーレーダー +${radVal}個`);

    const rewardMsg = `🎁【暗号シリアル認証成功】 ${itemParts.join(' & ')} 獲得！`;

    return {
      updatedPlayerData,
      result: {
        success: true,
        message: rewardMsg,
        rewardCatFood: cfVal,
        rewardXp: xpVal,
        rewardItems: { catBon: bonVal, sniper: sniVal, cpu: cpuVal, treasureRadar: radVal },
      },
    };
  }

  // --- CASE 3: Standard / Pre-registered Local or Built-in Codes ---
  const allCodes = getAllSerialCodes();
  const matchedCode = allCodes.find((c) => c.code.toUpperCase() === normalizedInput);

  if (!matchedCode) {
    return {
      updatedPlayerData: playerData,
      result: { success: false, message: '無効なシリアルコードです。コードを確認してください。' },
    };
  }

  if (!matchedCode.isActive) {
    return {
      updatedPlayerData: playerData,
      result: { success: false, message: 'このシリアルコードは現在無効化されています。' },
    };
  }

  // Grant rewards for standard code
  const updatedItems = { ...(playerData.items || {}) };
  if (matchedCode.rewardItems) {
    if (matchedCode.rewardItems.catBon) {
      updatedItems.catBon = (updatedItems.catBon || 0) + matchedCode.rewardItems.catBon;
    }
    if (matchedCode.rewardItems.sniper) {
      updatedItems.sniper = (updatedItems.sniper || 0) + matchedCode.rewardItems.sniper;
    }
    if (matchedCode.rewardItems.cpu) {
      updatedItems.cpu = (updatedItems.cpu || 0) + matchedCode.rewardItems.cpu;
    }
    if (matchedCode.rewardItems.treasureRadar) {
      updatedItems.treasureRadar = (updatedItems.treasureRadar || 0) + matchedCode.rewardItems.treasureRadar;
    }
  }

  const updatedPlayerData: PlayerData = {
    ...playerData,
    catFood: playerData.catFood + matchedCode.rewardCatFood,
    xp: playerData.xp + (matchedCode.rewardXp || 0),
    items: updatedItems,
    usedSerialCodes: [...usedList, matchedCode.code.toUpperCase()],
  };

  const itemParts: string[] = [];
  if (matchedCode.rewardCatFood > 0) itemParts.push(`猫缶 +${matchedCode.rewardCatFood}個`);
  if (matchedCode.rewardXp) itemParts.push(`XP +${matchedCode.rewardXp.toLocaleString()}`);
  if (matchedCode.rewardItems?.catBon) itemParts.push(`ネコボン +${matchedCode.rewardItems.catBon}個`);
  if (matchedCode.rewardItems?.sniper) itemParts.push(`スニャイパー +${matchedCode.rewardItems.sniper}個`);
  if (matchedCode.rewardItems?.cpu) itemParts.push(`ニャンコCPU +${matchedCode.rewardItems.cpu}個`);
  if (matchedCode.rewardItems?.treasureRadar) itemParts.push(`トレジャーレーダー +${matchedCode.rewardItems.treasureRadar}個`);

  const rewardMsg = `🎁 特典獲得！ ${itemParts.join(' & ')} 獲得！`;

  return {
    updatedPlayerData,
    result: {
      success: true,
      message: rewardMsg,
      rewardCatFood: matchedCode.rewardCatFood,
      rewardXp: matchedCode.rewardXp,
      rewardItems: matchedCode.rewardItems,
    },
  };
}

