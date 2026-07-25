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

// Helpers for Base64 cross-device universal encoding
export function encodeUniversalData(payload: unknown): string {
  try {
    const json = JSON.stringify(payload);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

export function decodeUniversalData<T>(base64Str: string): T | null {
  try {
    const json = decodeURIComponent(atob(base64Str.trim()));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// Generate Universal Portable Code string for a reward
export function generateUniversalRewardCode(codeName: string, catFood: number, xp: number = 0): string {
  const cleanName = codeName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${cleanName}-CF${catFood}-XP${xp}`;
}

// Generate Universal Code string for a custom cat
export function generateCustomCatShareCode(catUnit: CatUnitData): string {
  const base64 = encodeUniversalData(catUnit);
  return `CATUNIT-${base64}`;
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

  // --- CASE 1: Custom Cat Share Code (CATUNIT-<base64>) ---
  if (normalizedInput.startsWith('CATUNIT-')) {
    const base64Part = rawTrimmed.slice(8);
    const catUnit = decodeUniversalData<CatUnitData>(base64Part);

    if (!catUnit || !catUnit.id || !catUnit.baseName) {
      return {
        updatedPlayerData: playerData,
        result: { success: false, message: '無効なカスタムキャット共有コードです。' },
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
        message: `🐱【全端末共有】特注新種ニャンコ「${catUnit.baseName}」を獲得して解放しました！`,
        rewardUnit: catUnit,
      },
    };
  }

  // --- CASE 2: Universal Reward Code Format (e.g. CODE-CF100-XP5000 or GIFT-CF100) ---
  const cfMatch = normalizedInput.match(/CF(\d+)/i);
  const xpMatch = normalizedInput.match(/XP(\d+)/i);

  if (cfMatch || xpMatch) {
    const cfVal = cfMatch ? parseInt(cfMatch[1], 10) : 0;
    const xpVal = xpMatch ? parseInt(xpMatch[1], 10) : 0;

    if (cfVal > 0 || xpVal > 0) {
      const updatedPlayerData: PlayerData = {
        ...playerData,
        catFood: playerData.catFood + cfVal,
        xp: playerData.xp + xpVal,
        usedSerialCodes: [...usedList, normalizedInput],
      };

      const rewardMsg = xpVal > 0
        ? `🎁【全端末共有コード成功】 猫缶 +${cfVal}個 & XP +${xpVal.toLocaleString()} 獲得！`
        : `🎁【全端末共有コード成功】 猫缶 +${cfVal}個 獲得！`;

      return {
        updatedPlayerData,
        result: {
          success: true,
          message: rewardMsg,
          rewardCatFood: cfVal,
          rewardXp: xpVal,
        },
      };
    }
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
  const updatedPlayerData: PlayerData = {
    ...playerData,
    catFood: playerData.catFood + matchedCode.rewardCatFood,
    xp: playerData.xp + (matchedCode.rewardXp || 0),
    usedSerialCodes: [...usedList, matchedCode.code.toUpperCase()],
  };

  const rewardMsg = matchedCode.rewardXp
    ? `🎁 特典獲得！ 猫缶 +${matchedCode.rewardCatFood}個 & XP +${matchedCode.rewardXp.toLocaleString()} 獲得！`
    : `🎁 特典獲得！ 猫缶 +${matchedCode.rewardCatFood}個 獲得！`;

  return {
    updatedPlayerData,
    result: {
      success: true,
      message: rewardMsg,
      rewardCatFood: matchedCode.rewardCatFood,
      rewardXp: matchedCode.rewardXp,
    },
  };
}

