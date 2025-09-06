"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { getDocuments, getUsers } from "./actions";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { LEFT_MARGIN_DEFUALT, RIGHT_MARGIN_DEFUALT } from "@/constants/margin";

type User = { id: string; name: string; avatar: string; color: string }
type Document = { id: string; name: string }

export function Room({ children }: { children: ReactNode }) {
    const params = useParams();
    const [users, setUsers] = useState<User[]>([]);
    // 获取会话中，该组织的全部用户
    const fetchUsers = useMemo(() => async () => {
        try {
            const list = await getUsers();
            setUsers(list);
            console.log({ users });

        } catch {
            toast.error("Failed to fetch users");
        }
    }, []);
    // useEffect 确保 fetchUsers 只在组件挂载时执行一次
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <LiveblocksProvider
            throttle={16}
            authEndpoint={async () => {
                const endpoint = "/api/liveblocks-auth";
                const room = params.documentId as string;
                const response = await fetch(endpoint, {
                    method: "POST",
                    body: JSON.stringify({ room })
                });
                return await response.json();
            }}
            resolveUsers={({ userIds }) => {
                console.log({ userIds });
                console.log({ users });
                return userIds.map(
                    (userId) => users.find((user) => user.id === userId) ?? undefined
                );
            }}
            resolveMentionSuggestions={({ text }) => {
                let filteredUsers = users;
                if (text) {
                    filteredUsers = users.filter((user) =>
                        user.name.toLowerCase().includes(text.toLowerCase())
                    );
                }
                return filteredUsers.map((user) => user.id);
            }}
            resolveRoomsInfo={async ({ roomIds }) => {
                const documents: Document[] = await getDocuments(roomIds as Id<"documents">[]);
                return documents.map((document) => ({
                    id: document.id,
                    name: document.name,
                }));
            }}
        >
            <RoomProvider
                id={params.documentId as string}
                initialStorage={{ leftMargin: LEFT_MARGIN_DEFUALT, rightMargin: RIGHT_MARGIN_DEFUALT }}
            >
                <ClientSideSuspense fallback={<FullscreenLoader label="Room loading" />}>
                    {children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}