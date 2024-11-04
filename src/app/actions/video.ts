"use server";

import { db } from "@/lib/drizzle/db";
import { PostTable, VideoTable } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getVideoById(id: number) {
  const [video] = await db
    .select()
    .from(VideoTable)
    .where(eq(VideoTable.id, id))
    .limit(1);
  return video;
}

export async function getVideoByPostId(postId: number) {
  const [video] = await db
    .select({
      video: VideoTable,
    })
    .from(VideoTable)
    .innerJoin(PostTable, eq(VideoTable.id, PostTable.videoId))
    .where(eq(PostTable.id, postId))
    .limit(1);
  return video;
}
