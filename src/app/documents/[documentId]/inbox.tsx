"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ClientSideSuspense } from "@liveblocks/react";
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui";
import { useInboxNotifications } from "@liveblocks/react/suspense";
import { BellIcon } from "lucide-react";

export const Inbox = () => {
    return (
        <ClientSideSuspense fallback={
            <Button variant={"ghost"} className="relative" size="icon" disabled>
                <BellIcon className="size-5" />
            </Button>}>
            <InboxMenu />
        </ClientSideSuspense>
    );
};

const InboxMenu = () => {
    const { inboxNotifications } = useInboxNotifications();
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} className="relative" size="icon">
                        <BellIcon className="size-5" />
                        {inboxNotifications.length > 0 ? (
                            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-sky-500 text-xs text-white flex items-center justify-center">
                                {inboxNotifications.length}
                            </span>
                        ) : <></>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {inboxNotifications.length > 0 ? (
                        <InboxNotificationList>
                            {inboxNotifications.map((inboxNotification) => (
                                <InboxNotification
                                    key={inboxNotification.id}
                                    inboxNotification={inboxNotification}
                                />
                            ))}
                        </InboxNotificationList>
                    ) : (
                        <div className="p-2 w-[400px] text-center text-sm text-muted-foreground"></div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};