import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "../../../../convex/_generated/api";

// 初始化 Convex HTTP 客户端，用于与后端数据库交互
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// 初始化 Liveblocks 客户端，用于实时协作功能
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

/**
 * POST 请求处理函数 - 用于授权用户访问 Liveblocks 房间
 * 这个端点验证用户权限并生成 Liveblocks 访问令牌
 */
export async function POST(req: Request) {
  // 获取当前会话的声明信息（JWT claims）
  const { sessionClaims } = await auth();

  // 检查用户是否已认证（是否有有效的会话）
  if (!sessionClaims) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 获取当前用户的详细信息
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 从请求体中提取房间ID（即文档ID）
  const { room } = await req.json();

  // 从 Convex 数据库查询文档信息
  const document = await convex.query(api.documents.getById, { id: room });

  // 检查文档是否存在
  if (!document) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 检查当前用户是否是文档的所有者
  const isOwner = document.ownerId === user.id;

  // 从会话声明中提取组织信息（使用类型安全的方式）
  const orgObject = (sessionClaims as unknown as { o?: { id: string } }).o;

  // 检查当前用户是否是文档所属组织的成员
  const isOrganizationMember = !!(
    document.organizationId && document.organizationId === orgObject?.id
  );

  // 如果用户既不是所有者也不是组织成员，拒绝访问
  if (!isOwner && !isOrganizationMember) {
    return new Response("Unauthorized", { status: 401 });
  }

  /**
   * 准备 Liveblocks 会话
   * 创建用户会话并设置用户信息，这些信息将在实时协作中显示给其他用户
   */

  const name =
    user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
  const nameToNumber = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = Math.abs(nameToNumber) % 360;
  const color = `hsl(${hue},80%,60%)`;

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name:
        user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous", // 使用全名，如果没有则显示"Anonymous"
      avatar: user.imageUrl, // 用户头像URL
      color,
    },
  });

  // 授权用户对指定房间拥有完全访问权限
  session.allow(room, session.FULL_ACCESS);

  // 生成 Liveblocks 授权令牌
  const { body, status } = await session.authorize();

  // 返回授权响应
  return new Response(body, { status });
}
