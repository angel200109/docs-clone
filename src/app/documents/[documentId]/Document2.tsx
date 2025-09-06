"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Editor from "./editor";
import { Toolbar } from "./toolbar";
import { Navbar } from "./navbar";
import { Room } from "./room";

export default function Document2({ documentId }: { documentId: Id<"documents"> }) {
    // useQuery 是靠 websocket 实现的持久连接，当数据库发生更改时，会推送更新事件（保持订阅，不能在服务端使用，没有长连接）
    const document = useQuery(api.documents.getById, { id: documentId });

    if (document === undefined) return <div>Loading…</div>;
    if (document === null) throw new Error("Document Not Found");

    return (
        <Room>
            <div className="min-h-screen bg-[#FAFBFD]">
                <div className="flex flex-col px-4 pt-2 gap-y-2 fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden">
                    <Navbar data={document} />
                    <Toolbar />
                </div>
                <div className="pt-[114px] print:pt-0">

                    <Editor />
                </div>
            </div>
        </Room >
    );
}
