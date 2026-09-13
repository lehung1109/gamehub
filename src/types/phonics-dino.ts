// src/types/phonics-dino.ts

export type GeologicalEraId = 'triassic' | 'jurassic' | 'cretaceous' | 'iceage';

export type DinoDietType = 'herbivore' | 'carnivore' | 'omnivore' | 'piscivore';

export type PaleontologistRank = 'junior_digger' | 'expert_excavator' | 'legendary_dino_master';

export interface DinoChallenge {
  targetWord: string;
  phonicsFocus: string;
  vietnameseMeaning: string;
  phoneticBreakdown: string[];
  audioHint: string;
  paleoFactVi: string;
  boneScramble: string[];
}

export interface DinosaurFossil {
  id: string;
  eraId: GeologicalEraId;
  nameEn: string;
  nameVi: string;
  dinoEmoji: string;
  diet: DinoDietType;
  eraNameVi: string;
  amberReward: number;
  descriptionVi: string;
  challenge: DinoChallenge;
}

export interface GeologicalEraDefinition {
  id: GeologicalEraId;
  nameEn: string;
  nameVi: string;
  eraEmoji: string;
  themeColor: string;
  bgGradient: string;
  descriptionVi: string;
  requiredFossils: number;
}

export interface DinoProgress {
  completedFossilIds: string[];
  currentEra: GeologicalEraId;
  amberGems: number;
  paleontologistRank: PaleontologistRank;
  lastPlayedAt: string;
}
