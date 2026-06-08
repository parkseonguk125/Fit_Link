"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewRecord } from "@/lib/access";
import { extractYoutubeId, youtubeEmbedUrl } from "@/lib/youtube";
import type {
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
  visibility: Visibility;
  imageUrls?: { url: string; storagePath?: string }[];
  youtubeUrl?: string;
};

export async function createRecord(input: RecordInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const mediaData: {
    mediaType: "IMAGE" | "YOUTUBE";
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

  if (input.youtubeUrl) {
    const videoId = extractYoutubeId(input.youtubeUrl);
    if (videoId) {
      mediaData.push({
        mediaType: "YOUTUBE",
        url: youtubeEmbedUrl(videoId),
        sortOrder: mediaData.length,
      });
    }
  }

  const record = await prisma.record.create({
    data: {
      userId: session.user.id,
      category: input.category,
      exercisePart:
        input.category === "EXERCISE" ? input.exercisePart ?? "OTHER" : null,
      recordDate: new Date(input.recordDate),
      feltNote: input.feltNote ?? "",
      hardNote: input.hardNote ?? "",
      lackingNote: input.lackingNote ?? "",
      questionNote: input.questionNote ?? "",
      visibility: input.visibility,
      media: {
        create: mediaData,
      },
    },
  });

  revalidatePath("/feed");
  revalidatePath("/me/records");
  redirect(`/records/${record.id}`);
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
    throw new Error("본인은 팔로우할 수 없습니다.");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });
  } else {
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    });
  }

  revalidatePath("/feed");
  revalidatePath(`/users/${targetUserId}`);
}

export async function updateProfile(data: {
  displayName: string;
  bio: string;
  role: "USER" | "TRAINER";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: data.displayName.trim(),
      bio: data.bio.trim(),
      role: data.role,
    },
  });

  revalidatePath("/me");
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

  return prisma.user.findMany({
    where: {
      AND: [
        { id: { not: session.user.id } },
        {
          OR: [
            { displayName: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      id: true,
      displayName: true,
      bio: true,
      role: true,
    },
    take: 10,
  });
}
