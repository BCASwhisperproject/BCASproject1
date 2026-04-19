import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { generateUsername, AVATAR_COLORS } from "./utils";
import type { UserProfile } from "@/types";

export async function getOrCreateDbUser(): Promise<{
  user: UserProfile | null;
  error?: string;
}> {
  const { userId } = await auth();
  if (!userId) return { user: null, error: "Unauthenticated" };

  // Try to find existing user
  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!dbUser) {
    const clerkUser = await currentUser();
    if (!clerkUser) return { user: null, error: "Clerk user not found" };

    const email =
      clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@unknown.com`;

    // Generate a unique username (persistent — never changes)
    let username = generateUsername();
    let attempts = 0;
    while (attempts < 20) {
      const exists = await prisma.user.findUnique({ where: { username } });
      if (!exists) break;
      username = generateUsername();
      attempts++;
    }

    const avatarColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    dbUser = await prisma.user.create({
      data: { clerkId: userId, email, username, avatarColor },
    });
  }

  // Update streak
  const today = new Date().toISOString().slice(0, 10);
  const lastActive = dbUser.lastActive?.toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastActive !== today) {
    const newStreak =
      lastActive === yesterday ? dbUser.streak + 1 : 1;
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { streak: newStreak, lastActive: new Date() },
    });
  }

  const todayDate = new Date().toISOString().slice(0, 10);
  const lastPostDate = dbUser.lastPostDate?.toISOString().slice(0, 10);
  const postsToday = lastPostDate === todayDate ? dbUser.postsToday : 0;

  return {
    user: {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      username: dbUser.username,
      avatarColor: dbUser.avatarColor,
      isAdmin: dbUser.isAdmin,
      isApproved: dbUser.isApproved,
      postsToday,
      streak: dbUser.streak,
    },
  };
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function apiOk(data: unknown, status = 200) {
  return Response.json(data, { status });
}
