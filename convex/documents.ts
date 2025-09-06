import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
// 新增文档
export const create = mutation({
  args: {
    title: v.optional(v.string()),
    initialContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;
    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled document",
      ownerId: user.subject,
      organizationId,
      initialContent: args.initialContent,
    });
  },
});

// 定义一个 query 方法，用于获取文档（支持分页和搜索）
export const get = query({
  args: {
    paginationOpts: paginationOptsValidator, // 分页参数校验器
    search: v.optional(v.string()), // 可选的搜索关键词
  },
  handler: async (ctx, { search, paginationOpts }) => {
    // 获取当前登录用户
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized"); // 如果没有用户，抛出未授权错误
    }

    // 从用户信息中提取组织 ID（如果存在）
    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    // 情况 1：如果有搜索词，并且用户属于某个组织
    if (search && organizationId) {
      return await ctx.db
        .query("documents")
        .withSearchIndex(
          "search_title",
          (q) => q.search("title", search).eq("organizationId", organizationId) // 搜索标题并过滤组织
        )
        .paginate(paginationOpts); // 返回分页结果
    }

    // 情况 2：如果用户属于某个组织，但没有搜索词
    if (organizationId) {
      return await ctx.db
        .query("documents")
        .withIndex(
          "by_organization_id",
          (q) => q.eq("organizationId", organizationId) // 查询该组织下的所有文档
        )
        .paginate(paginationOpts);
    }

    // 情况 3：用户不属于任何组织，但输入了搜索词
    if (search) {
      return await ctx.db
        .query("documents")
        .withSearchIndex(
          "search_title",
          (q) => q.search("title", search).eq("ownerId", user.subject) // 搜索标题并限定为用户个人文档
        )
        .paginate(paginationOpts);
    }

    // 情况 4：默认情况 —— 返回当前用户的所有个人文档
    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", user.subject)) // 查询用户本人创建的文档
      .paginate(paginationOpts);
  },
});

// 删除文档
export const removeById = mutation({
  // 定义 mutation 的参数验证规则
  args: {
    id: v.id("documents"), // 参数：文档ID，必须是 documents 表的有效文档ID
  },
  // mutation 的处理函数
  handler: async (ctx, args) => {
    // 1. 身份验证：获取当前用户身份
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized"); // 未登录用户无权操作
    }
    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;
    // 2. 检查文档是否存在：根据ID查询文档
    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new ConvexError("Document not found"); // 文档不存在
    }
    // 3. 权限验证：检查当前用户是否是文档的所有者
    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    );
    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized"); // 非所有者无权删除
    }
    // 4. 执行删除操作：删除指定ID的文档
    return ctx.db.delete(args.id);
  },
});

// 修改文档名字
export const renameById = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;
    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new ConvexError("Document not found");
    }
    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    );
    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }
    return await ctx.db.patch(args.id, { title: args.title });
  },
});

// 通过id找文档
export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const document = await ctx.db.get(id);
    if (!document) {
      throw new ConvexError("Document Not Found");
    }
    return document;
  },
});

// 通过documentID 的数组，获取document的信息（id+title）
export const getByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, { ids }) => {
    const documents = [];
    for (const id of ids) {
      const document = await ctx.db.get(id);
      if (document) {
        documents.push({ id: document._id, name: document.title });
      } else {
        documents.push({ id, name: "[Removed]" });
      }
    }
    return documents;
  },
});
