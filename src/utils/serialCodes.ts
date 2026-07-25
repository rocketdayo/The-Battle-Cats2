import { SerialCode, PlayerData } from '../types';

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
];

const CUSTOM_CODES_STORAGE_KEY = 'nyanko_custom_serial_codes';

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
  // Filter out duplicates if custom code overrides default code
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
}

// Validate and process serial code claim
export function claimSerialCode(
  rawInputCode: string,
  playerData: PlayerData
): { updatedPlayerData: PlayerData; result: RedeemResult } {
  const normalizedInput = rawInputCode.trim().toUpperCase();

  if (!normalizedInput) {
    return {
      updatedPlayerData: playerData,
      result: { success: false, message: 'シリアルコードを入力してください。' },
    };
  }

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

  const usedList = playerData.usedSerialCodes || [];
  if (usedList.includes(matchedCode.code.toUpperCase())) {
    return {
      updatedPlayerData: playerData,
      result: { success: false, message: 'このシリアルコードは既に受取済みです。' },
    };
  }

  // Grant rewards
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
