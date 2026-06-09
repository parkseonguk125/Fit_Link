"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewRecord } from "@/lib/access";
import { assertDisplayNameAvailable } from "@/lib/display-name";
import { type FollowState } from "@/lib/follow";
import { parseLinkUrl } from "@/lib/link-url";
import { deleteUploadedFile } from "@/lib/storage";
import type {
  CardioType,
  Category,
  ExercisePart,
  Visibility,
} from "@/generated/prisma/client";

type RecordInput = {
  category: Category;
  exercisePart?: ExercisePart | null;
  recordDate: string;
  feltNote?: string;
  hardNote?: string;
  lackingNote?: string;
  questionNote?: string;
  visibility?: Visibility;
  imageUrls?: { url: string; storagePath?: string }[];
  linkUrl?: string;
  dietItems?: {
    foodName: string;
    matchedName: string;
    servingLabel: string;
    caloriesPerServing: number;
    servings: number;
    totalCalories: number;
    sortOrder: number;
  }[];
  cardioType?: CardioType | null;
  cardioDurationHours?: number | null;
  cardioDurationMin?: number | null;
  cardioDistanceKm?: number | null;
  cardioCalories?: number | null;
  cardioHeartRateBpm?: number | null;
  exerciseEntries?: {
    exerciseKey: string;
    exerciseName: string;
    sortOrder: number;
    sets: {
      setNumber: number;
      weightKg: number | null;
      reps: number | null;
      sortOrder: number;
    }[];
  }[];
};

export async function createRecord(input: RecordInput): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const mediaData: {
    mediaType: "IMAGE" | "YOUTUBE" | "LINK";
    url: string;
    storagePath?: string;
    sortOrder: number;
  }[] = [];

  input.imageUrls?.forEach((image, index) => {
    mediaData.push({
      mediaType: "IMAGE",
      url: image.url,
      storagePath: image.storagePath,
      sortOrder: index,
    });
  });

  if (input.linkUrl?.trim()) {
    const parsed = parseLinkUrl(input.linkUrl);
    if (!parsed) {
      throw new Error("올바른 URL을 입력해 주세요.");
    }

    mediaData.push({
      mediaType: parsed.mediaType,
      url: parsed.url,
      sortOrder: mediaData.length,
    });
  }

  const record = await prisma.record.create({
    data: {
      userId: session.user.id,
      category: input.category,
      exercisePart:
        input.category === "EXERCISE" ? input.exercisePart ?? "OTHER" : null,
      cardioType:
        input.category === "CARDIO" ? input.cardioType ?? null : null,
      cardioDurationHours:
        input.category === "CARDIO" ? input.cardioDurationHours ?? null : null,
      cardioDurationMin:
        input.category === "CARDIO" ? input.cardioDurationMin ?? null : null,
      cardioDistanceKm:
        input.category === "CARDIO" ? input.cardioDistanceKm ?? null : null,
      cardioCalories:
        input.category === "CARDIO" ? input.cardioCalories ?? null : null,
      cardioHeartRateBpm:
        input.category === "CARDIO" ? input.cardioHeartRateBpm ?? null : null,
      recordDate: new Date(input.recordDate),
      feltNote: input.feltNote ?? "",
      hardNote: input.hardNote ?? "",
      lackingNote: input.lackingNote ?? "",
      questionNote: input.questionNote ?? "",
      visibility: input.visibility ?? "PUBLIC",
      media: {
        create: mediaData,
      },
      dietItems:
        input.category === "DIET" && input.dietItems?.length
          ? {
              create: input.dietItems.map((item) => ({
                foodName: item.foodName,
                matchedName: item.matchedName,
                servingLabel: item.servingLabel,
                caloriesPerServing: item.caloriesPerServing,
                servings: item.servings,
                totalCalories: item.totalCalories,
                sortOrder: item.sortOrder,
              })),
            }
          : undefined,
      exerciseEntries:
        input.category === "EXERCISE" && input.exerciseEntries?.length
          ? {
              create: input.exerciseEntries.map((entry) => ({
                exerciseKey: entry.exerciseKey,
                exerciseName: entry.exerciseName,
                sortOrder: entry.sortOrder,
                sets: {
                  create: entry.sets.map((set) => ({
                    setNumber: set.setNumber,
                    weightKg: set.weightKg,
                    reps: set.reps,
                    sortOrder: set.sortOrder,
                  })),
                },
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/feed");
  revalidatePath("/following");
  revalidatePath("/me/records");

  redirect(`/records/${record.id}`);
}

export async function deleteRecords(recordIds: string[]): Promise<{ deleted: number }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const uniqueIds = [...new Set(recordIds)];
  if (uniqueIds.length === 0) {
    throw new Error("삭제할 기록을 선택해 주세요.");
  }

  const records = await prisma.record.findMany({
    where: {
      id: { in: uniqueIds },
      userId: session.user.id,
    },
    include: { media: true },
  });

  if (records.length !== uniqueIds.length) {
    throw new Error("삭제할 수 없는 기록이 포함되어 있습니다.");
  }

  for (const record of records) {
    for (const media of record.media) {
      if (media.mediaType === "IMAGE" && media.storagePath) {
        await deleteUploadedFile(media.storagePath);
      }
    }
  }

  await prisma.record.deleteMany({
    where: {
      id: { in: uniqueIds },
      userId: session.user.id,
    },
  });

  revalidatePath("/me/records");
  revalidatePath("/feed");
  revalidatePath("/following");
  revalidatePath(`/users/${session.user.id}`);

  return { deleted: records.length };
}

export async function deleteRecord(recordId: string): Promise<void> {
  await deleteRecords([recordId]);
}

export async function addComment(recordId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("댓글 내용을 입력해 주세요.");
  }

  const record = await prisma.record.findUnique({ where: { id: recordId } });
  if (!record) {
    throw new Error("기록을 찾을 수 없습니다.");
  }

  const allowed = await canViewRecord(record, session.user.id);
  if (!allowed) {
    throw new Error("댓글을 작성할 권한이 없습니다.");
  }

  await prisma.comment.create({
    data: {
      recordId,
      userId: session.user.id,
      content: trimmed,
    },
  });

  revalidatePath(`/records/${recordId}`);
}

export async function toggleFollow(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  if (session.user.id === targetUserId) {
    throw new Error("본인은 친구로 추가할 수 없습니다.");
  }

  const outgoing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  if (outgoing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });
  } else {
    const incoming = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: targetUserId,
          followingId: session.user.id,
        },
      },
    });

    if (incoming?.status === "ACCEPTED") {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: targetUserId,
            followingId: session.user.id,
          },
        },
      });
    } else {
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
          status: "PENDING",
        },
      });
    }
  }

  revalidatePath("/feed");
  revalidatePath("/following");
  revalidatePath("/me");
  revalidatePath(`/users/${targetUserId}`);
}

export async function removeFriend(friendUserId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  if (session.user.id === friendUserId) {
    throw new Error("본인은 친구 목록에서 삭제할 수 없습니다.");
  }

  const deleted = await prisma.follow.deleteMany({
    where: {
      status: "ACCEPTED",
      OR: [
        {
          followerId: session.user.id,
          followingId: friendUserId,
        },
        {
          followerId: friendUserId,
          followingId: session.user.id,
        },
      ],
    },
  });

  if (deleted.count === 0) {
    throw new Error("친구 관계가 없습니다.");
  }

  revalidatePath("/feed");
  revalidatePath("/following");
  revalidatePath("/me");
  revalidatePath(`/users/${friendUserId}`);
}

export async function acceptFollowRequest(followerId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const request = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: session.user.id,
      },
    },
  });

  if (!request || request.status !== "PENDING") {
    throw new Error("수락할 친구 요청이 없습니다.");
  }

  await prisma.follow.update({
    where: {
      followerId_followingId: {
        followerId,
        followingId: session.user.id,
      },
    },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/feed");
  revalidatePath("/following");
  revalidatePath("/me");
  revalidatePath(`/users/${followerId}`);
  revalidatePath(`/users/${session.user.id}`);
}

export async function updateProfile(data: {
  displayName: string;
  bio: string;
  role: "USER" | "TRAINER";
  trainerRegion?: string;
  trainerGymName?: string;
  trainerPosition?: string;
  trainerCareer?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const isTrainer = data.role === "TRAINER";

  await assertDisplayNameAvailable(data.displayName, session.user.id);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: data.displayName.trim(),
      bio: data.bio.trim(),
      role: data.role,
      trainerRegion: isTrainer ? (data.trainerRegion ?? "").trim() : "",
      trainerGymName: isTrainer ? (data.trainerGymName ?? "").trim() : "",
      trainerPosition: isTrainer ? (data.trainerPosition ?? "").trim() : "",
      trainerCareer: isTrainer ? (data.trainerCareer ?? "").trim() : "",
    },
  });

  revalidatePath("/me");
  revalidatePath(`/users/${session.user.id}`);
}

export async function deleteAccount(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const userId = session.user.id;

  const records = await prisma.record.findMany({
    where: { userId },
    include: { media: true },
  });

  for (const record of records) {
    for (const media of record.media) {
      if (media.mediaType === "IMAGE" && media.storagePath) {
        await deleteUploadedFile(media.storagePath);
      }
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/feed");
  revalidatePath("/following");
  revalidatePath("/me");
  revalidatePath("/me/records");
  revalidatePath(`/users/${userId}`);
}

export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const pattern = `%${trimmed.toLowerCase()}%`;

  const users = await prisma.$queryRaw<
    {
      id: string;
      displayName: string;
      bio: string;
      role: "USER" | "TRAINER";
    }[]
  >`
    SELECT id, "displayName", bio, role
    FROM "User"
    WHERE id <> ${session.user.id}
      AND (
        LOWER("displayName") LIKE ${pattern}
        OR LOWER(email) LIKE ${pattern}
      )
    ORDER BY "displayName" ASC
    LIMIT 10
  `;

  const viewerId = session.user.id;
  const userIds = users.map((user) => user.id);

  const follows = await prisma.follow.findMany({
    where: {
      OR: [
        {
          followerId: viewerId,
          followingId: { in: userIds },
        },
        {
          followingId: viewerId,
          followerId: { in: userIds },
        },
      ],
    },
    select: { followerId: true, followingId: true, status: true },
  });

  function resolveFollowState(userId: string): FollowState {
    const related = follows.filter(
      (follow) =>
        (follow.followerId === viewerId && follow.followingId === userId) ||
        (follow.followerId === userId && follow.followingId === viewerId),
    );

    if (related.some((follow) => follow.status === "ACCEPTED")) {
      return "accepted";
    }

    const outgoing = related.find((follow) => follow.followerId === viewerId);
    if (outgoing?.status === "PENDING") {
      return "pending";
    }

    return "none";
  }

  return users.map((user) => ({
    ...user,
    followState: resolveFollowState(user.id),
  }));
}

export async function getPreviousExerciseSets(exerciseKey: string) {
  const session = await auth();
  if (!session?.user?.id || !exerciseKey) {
    return [];
  }

  const previousEntry = await prisma.exerciseEntry.findFirst({
    where: {
      exerciseKey,
      record: {
        userId: session.user.id,
        category: "EXERCISE",
      },
    },
    orderBy: [{ record: { recordDate: "desc" } }, { record: { createdAt: "desc" } }],
    include: {
      sets: {
        orderBy: { setNumber: "asc" },
      },
    },
  });

  if (!previousEntry) {
    return [];
  }

  return previousEntry.sets
    .filter((set) => set.weightKg != null && set.reps != null)
    .map((set) => ({
      setNumber: set.setNumber,
      weightKg: set.weightKg!,
      reps: set.reps!,
    }));
}
