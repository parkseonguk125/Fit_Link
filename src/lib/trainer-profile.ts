export type TrainerProfile = {
  trainerRegion: string;
  trainerGymName: string;
  trainerPosition: string;
  trainerCareer: string;
};

export const emptyTrainerProfile: TrainerProfile = {
  trainerRegion: "",
  trainerGymName: "",
  trainerPosition: "",
  trainerCareer: "",
};

export function parseTrainerProfile(body: Record<string, unknown>): TrainerProfile {
  return {
    trainerRegion: String(body.trainerRegion ?? "").trim(),
    trainerGymName: String(body.trainerGymName ?? "").trim(),
    trainerPosition: String(body.trainerPosition ?? "").trim(),
    trainerCareer: String(body.trainerCareer ?? "").trim(),
  };
}
