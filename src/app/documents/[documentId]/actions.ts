"use server";

import { ConvexHttpClient } from "convex/browser";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
// 一个服务端函数，用于获取当前组织下的用户列表

export async function getUsers() {
  // 调用 Clerk 的 auth() 方法，获取当前会话（session）的声明信息
  // sessionClaims 中可能包含组织 ID、用户信息等
  const { sessionClaims } = await auth();
  // 获取 Clerk 的服务端客户端实例，用来调用用户/组织等 API
  const clerk = await clerkClient();
  // 从 sessionClaims 中解析出组织 ID, 由于 TypeScript 默认不识别 `o.id`，这里做了类型断言
  const organizationId = (sessionClaims as { o?: { id: string } })?.o?.id;
  // 如果没有获取到组织 ID，直接抛出错误
  if (!organizationId) {
    throw new Error("Organization ID is missing");
  }

  // 调用 Clerk 的 users.getUserList API, 传入组织 ID，用来获取该组织下的所有用户列表
  const response = await clerk.users.getUserList({
    organizationId: [organizationId],
  });

  // 从返回结果中提取需要的字段
  // const users = response.data.map((user) => ({
  //   id: user.id,
  //   name:
  //     user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
  //   avatar: user.imageUrl,
  // }));
  const users = response.data.map((user) => {
    const name =
      user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";

    const nameToNumber = Array.from(name).reduce(
      (acc, ch) => acc + ch.charCodeAt(0),
      0
    );
    const hue = Math.abs(nameToNumber) % 360;
    const color = `hsl(${hue},80%,60%)`;

    return {
      id: user.id,
      name,
      avatar: user.imageUrl,
      color,
    };
  });

  return users;
}

export async function getDocuments(ids: Id<"documents">[]) {
  const result = await convex.query(api.documents.getByIds, { ids });
  return result ?? [];
}
