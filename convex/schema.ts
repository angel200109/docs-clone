import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 定义了一个名为 "documents" 的数据表
  documents: defineTable({
    // 表字段定义
    title: v.string(),
    initialContent: v.optional(v.string()),
    ownerId: v.string(),
    roomId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  })
    // 索引配置(用于快速查询)
    .index("by_owner_id", ["ownerId"])
    .index("by_organization_id", ["organizationId"])
    // 搜索索引配置
    .searchIndex("search_title", {
      searchField: "title", //对 title 字段进行全文搜索
      filterFields: ["ownerId", "organizationId"], // 在搜索时对 ownerId 和 organizationId 进行过滤
    }),
});
