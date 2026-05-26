import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { LeagueMessage } from "../../types";
import axiosInstance from "../../api/axiosInstance";

interface LeagueWallProps {
  leagueName: string;
  leagueId?: string | null;
  currentUserFullName?: string;
}

const MAX_MESSAGE_LENGTH = 420;
const PAGE_SIZE = 30;
const SEND_COOLDOWN_MS = 2000;

interface MessagePage {
  messages: LeagueMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

const formatMessageDateTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) {
    return timePart;
  }
  if (isYesterday) {
    return `Yesterday ${timePart}`;
  }

  const includeYear = date.getFullYear() !== now.getFullYear();
  const datePart = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  });

  return `${datePart}, ${timePart}`;
};

const normalizeMessage = (raw: any): LeagueMessage => {
  const authorName =
    raw?.authorName ||
    raw?.senderFullName ||
    raw?.senderName ||
    [raw?.author?.firstName, raw?.author?.lastName].filter(Boolean).join(" ") ||
    raw?.author?.username ||
    "Unknown User";

  return {
    id: String(raw?.id ?? `unknown-${Math.random()}`),
    authorName,
    content: String(raw?.content ?? ""),
    createdAt: new Date(raw?.createdAt ?? Date.now()).toISOString(),
  };
};

const messageIdentity = (message: LeagueMessage) =>
  `${message.id}|${message.authorName}|${message.content}|${message.createdAt}`;

const dedupeMessages = (messages: LeagueMessage[]) => {
  const seen = new Set<string>();
  return messages.filter((message) => {
    const key = messageIdentity(message);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const mergeAndSortMessages = (base: LeagueMessage[], incoming: LeagueMessage[]) => {
  const merged = dedupeMessages([...base, ...incoming]);
  return merged.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

const AUTHOR_COLOR_CLASSES = [
  "text-blue-700",
  "text-red-700",
  "text-emerald-700",
  "text-purple-700",
  "text-amber-700",
  "text-cyan-700",
  "text-pink-700",
  "text-indigo-700",
];

const getAuthorColorClass = (authorName: string) => {
  let hash = 0;
  for (let index = 0; index < authorName.length; index += 1) {
    hash = (hash * 31 + authorName.charCodeAt(index)) >>> 0;
  }
  return AUTHOR_COLOR_CLASSES[hash % AUTHOR_COLOR_CLASSES.length];
};

const LeagueWall: React.FC<LeagueWallProps> = ({
  leagueName,
  leagueId,
  currentUserFullName,
}) => {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [draft, setDraft] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<LeagueMessage[]>([]);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const desktopMessagesRef = useRef<HTMLDivElement | null>(null);
  const mobileMessagesRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const messagesQueryKey = useMemo(
    () => ["league-messages-paged", leagueId],
    [leagueId]
  );

  const {
    data: pagedData,
    isLoading,
    isError: isHistoryError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<MessagePage>({
    queryKey: messagesQueryKey,
    enabled: !!leagueId,
    initialPageParam: null as string | null,
    maxPages: 5,
    queryFn: async ({ pageParam }) => {
      const response = await axiosInstance.get(`/private-league/${leagueId}/messages`, {
        params: {
          limit: PAGE_SIZE,
          before: pageParam,
        },
      });
      const payload = response.data?.data ?? response.data;
      const pageInfo = response.data?.pageInfo;
      if (!Array.isArray(payload)) {
        return {
          messages: [],
          nextCursor: null,
          hasMore: false,
        };
      }
      const serverMessages = payload.map(normalizeMessage);
      return {
        messages: serverMessages,
        nextCursor: pageInfo?.nextCursor ?? null,
        hasMore: Boolean(pageInfo?.hasMore),
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
  });

  const serverMessages = useMemo(() => {
    const pages = pagedData?.pages ?? [];
    const flattened = pages.flatMap((page) => page.messages);
    return mergeAndSortMessages(flattened, []);
  }, [pagedData]);

  const latestCursor = useMemo(() => {
    const latest = serverMessages[serverMessages.length - 1];
    if (!latest) {
      return null;
    }
    return `${latest.createdAt}|${latest.id}`;
  }, [serverMessages]);

  useQuery({
    queryKey: ["league-messages-latest", leagueId, latestCursor],
    enabled: !!leagueId && !!latestCursor,
    refetchInterval: 5000,
    queryFn: async () => {
      const response = await axiosInstance.get(`/private-league/${leagueId}/messages`, {
        params: {
          limit: PAGE_SIZE,
          after: latestCursor,
        },
      });
      const payload = response.data?.data ?? response.data;
      if (!Array.isArray(payload)) {
        return;
      }
      const newestMessages = payload.map(normalizeMessage);
      if (newestMessages.length === 0) {
        return;
      }
      queryClient.setQueryData<InfiniteData<MessagePage>>(messagesQueryKey, (previous) => {
        if (!previous || previous.pages.length === 0) {
          return previous;
        }
        const firstPage = previous.pages[0];
        const nextPages = [...previous.pages];
        nextPages[0] = {
          ...firstPage,
          messages: mergeAndSortMessages(firstPage.messages, newestMessages),
        };
        return {
          ...previous,
          pages: nextPages,
        };
      });
    },
  });

  const messages = useMemo(
    () => mergeAndSortMessages(serverMessages, optimisticMessages),
    [optimisticMessages, serverMessages]
  );

  const removeOptimisticMessage = (optimisticId: string) => {
    setOptimisticMessages((previous) =>
      previous.filter((message) => message.id !== optimisticId)
    );
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await axiosInstance.post(
        `/private-league/${leagueId}/messages`,
        { content }
      );
      const payload = response.data?.data ?? response.data;
      if (payload) {
        return normalizeMessage(payload);
      }
      return {
        id: `server-${Date.now()}`,
        authorName: currentUserFullName?.trim() || "You",
        content,
        createdAt: new Date().toISOString(),
      } as LeagueMessage;
    },
    onMutate: async (content: string) => {
      queryClient.cancelQueries({ queryKey: messagesQueryKey });
      const optimisticId = `local-${Date.now()}`;
      const optimisticMessage: LeagueMessage = {
        id: optimisticId,
        authorName: currentUserFullName?.trim() || "You",
        content,
        createdAt: new Date().toISOString(),
      };
      setOptimisticMessages((previous) =>
        mergeAndSortMessages(previous, [optimisticMessage])
      );
      return { optimisticId };
    },
    onError: (_error, _content, context) => {
      if (context?.optimisticId) {
        removeOptimisticMessage(context.optimisticId);
      }
    },
    onSuccess: (createdMessage, _content, context) => {
      if (!createdMessage || !context?.optimisticId) {
        return;
      }
      removeOptimisticMessage(context.optimisticId);
      queryClient.setQueryData<InfiniteData<MessagePage>>(messagesQueryKey, (previous) => {
        if (!previous || previous.pages.length === 0) {
          return previous;
        }
        const firstPage = previous.pages[0];
        const nextPages = [...previous.pages];
        nextPages[0] = {
          ...firstPage,
          messages: mergeAndSortMessages(firstPage.messages, [createdMessage]),
        };
        return {
          ...previous,
          pages: nextPages,
        };
      });
    },
  });

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setNowTick(Date.now());
    }, 200);
    return () => window.clearInterval(intervalId);
  }, [cooldownUntil]);

  const isCooldownActive = cooldownUntil > nowTick;
  const canSend =
    !!leagueId &&
    draft.trim().length > 0 &&
    !sendMessageMutation.isPending &&
    !isCooldownActive;
  const normalizedCurrentUserName = (currentUserFullName ?? "").trim().toLowerCase();
  const unreadCount = Math.min(messages.length, 9);

  useEffect(() => {
    if (!shouldScrollToBottom) {
      return;
    }
    const scrollToBottom = (element: HTMLDivElement | null) => {
      if (!element) {
        return;
      }
      element.scrollTop = element.scrollHeight;
    };
    scrollToBottom(desktopMessagesRef.current);
    scrollToBottom(mobileMessagesRef.current);
    setShouldScrollToBottom(false);
  }, [messages, shouldScrollToBottom]);

  const handleSend = () => {
    const content = draft.trim();
    if (
      !content ||
      !leagueId ||
      sendMessageMutation.isPending ||
      isCooldownActive
    ) {
      return;
    }
    setCooldownUntil(Date.now() + SEND_COOLDOWN_MS);
    setNowTick(Date.now());
    setShouldScrollToBottom(true);
    sendMessageMutation.mutate(content);
    setDraft("");
  };

  const renderMessages = () => (
    <div className="space-y-3">
      {!leagueId ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
          League messages are available for private leagues only.
        </div>
      ) : null}
      {leagueId && isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading messages...
        </div>
      ) : null}
      {leagueId && !isLoading && messages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          No messages yet. Start the conversation.
        </div>
      ) : null}
      {leagueId && isHistoryError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load messages.
        </div>
      ) : null}
      {leagueId && hasNextPage ? (
        <button
          type="button"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading older..." : "Load older messages"}
        </button>
      ) : null}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.authorName.trim().toLowerCase() === normalizedCurrentUserName
              ? "justify-start"
              : "justify-end"
          }`}
        >
          <article
            className={`w-full max-w-[88%] rounded-xl border border-gray-200 px-3 py-2 shadow-sm ${
              message.authorName.trim().toLowerCase() === normalizedCurrentUserName
                ? "bg-blue-50"
                : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <strong
                className={`text-sm ${getAuthorColorClass(message.authorName)}`}
              >
                {message.authorName}
              </strong>
              <span className="text-xs text-gray-500">
                {formatMessageDateTime(message.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700 break-words">
              {message.content}
            </p>
          </article>
        </div>
      ))}
    </div>
  );

  const renderComposer = (isMobile = false) => (
    <div className={isMobile ? "border-t border-gray-200 pt-3" : "pt-3"}>
      <textarea
        value={draft}
        maxLength={MAX_MESSAGE_LENGTH}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        placeholder="Say something to the league..."
        disabled={!leagueId || sendMessageMutation.isPending}
        className={`w-full resize-none rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-colors-nba-blue focus:ring-2 focus:ring-blue-100 ${
          isMobile
            ? "text-base"
            : "text-sm"
        }`}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">
          {draft.length}/{MAX_MESSAGE_LENGTH}
        </span>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="rounded-full bg-colors-nba-blue px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendMessageMutation.isPending || isCooldownActive
            ? "Sending..."
            : "Send"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isDesktopOpen ? (
        <section className="hidden lg:flex lg:w-[360px] lg:shrink-0">
          <div className="sticky top-24 flex h-[78vh] w-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="mb-3 border-b border-gray-200 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-colors-nba-blue">
                    League Trash Talk
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Live league chat for {leagueName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDesktopOpen(false)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Hide
                </button>
              </div>
            </div>
          <div ref={desktopMessagesRef} className="flex-1 overflow-y-auto pr-1">
            {renderMessages()}
          </div>
            {renderComposer()}
          </div>
        </section>
      ) : (
        <section className="hidden lg:flex lg:w-[74px] lg:shrink-0">
          <div className="sticky top-24 flex h-[78vh] w-full items-start justify-center">
            <button
              type="button"
              onClick={() => setIsDesktopOpen(true)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-colors-nba-blue shadow-sm hover:bg-gray-50"
            >
              Open Chat
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsMobileSheetOpen(true)}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 z-30 flex items-center gap-2 rounded-full bg-colors-nba-blue px-4 py-3 text-sm font-bold text-white shadow-xl ring-2 ring-colors-nba-yellow/60 lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="size-5"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m2.625 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H18m-9 4.5h6m-7.5 3.375h9.75A2.625 2.625 0 0 0 19.875 15V9A2.625 2.625 0 0 0 17.25 6.375H6.75A2.625 2.625 0 0 0 4.125 9v6A2.625 2.625 0 0 0 6.75 17.625Z"
          />
        </svg>
        <span className="hidden sm:inline">League Trash Talk</span>
        <span className="sm:hidden">Trash Talk</span>
        <span className="ml-2 rounded-full bg-colors-nba-yellow px-2 py-0.5 text-xs text-black">
          {unreadCount}
        </span>
      </button>

      {isMobileSheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close league talk"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setIsMobileSheetOpen(false)}
          />
          <section className="fixed inset-x-0 bottom-0 z-50 h-[74vh] rounded-t-3xl bg-white p-4 shadow-2xl lg:hidden">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-colors-nba-blue">
                League Trash Talk
              </h2>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex h-[calc(100%-3.5rem)] flex-col">
              <div ref={mobileMessagesRef} className="flex-1 overflow-y-auto pr-1">
                {renderMessages()}
              </div>
              {renderComposer(true)}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default LeagueWall;
