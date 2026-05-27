import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  api,
  type ApiEvent,
  type SavedEventWithEventResponse,
} from "~/lib/api";
import { useAuth } from "~/lib/auth";

type SaveMutationInput = {
  eventId: string;
  event?: ApiEvent;
};

const emptySavedEventIds = new Set<string>();
const emptySavedEvents: SavedEventWithEventResponse[] = [];

function savedEventsQueryKey(userId: string | null | undefined) {
  return ["saved-events", userId ?? "anonymous"] as const;
}

export function useSavedEventsList() {
  const { token, profile } = useAuth();

  const query = useQuery({
    queryKey: savedEventsQueryKey(profile?.id),
    queryFn: async () => {
      if (!token || !profile) return emptySavedEvents;
      const data = await api.saved.list(token);
      return data.saved_events;
    },
    enabled: Boolean(token && profile),
  });

  return {
    ...query,
    data: query.data ?? emptySavedEvents,
  };
}

export function useSavedEventIds() {
  const savedEventsQuery = useSavedEventsList();

  return {
    ...savedEventsQuery,
    data: new Set(savedEventsQuery.data.map((saved) => saved.event_id)),
  };
}

export function useSavedEventDetails() {
  const savedEventsQuery = useSavedEventsList();

  return {
    ...savedEventsQuery,
    data: savedEventsQuery.data.map((saved) => saved.event),
  };
}

export function useSavedEventMutations() {
  const { token, profile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = savedEventsQueryKey(profile?.id);

  const save = useMutation({
    mutationFn: async ({ eventId }: SaveMutationInput) => {
      if (!token || !profile) throw new Error("Sign in before saving events.");
      await api.saved.save(token, eventId);
    },
    onMutate: async ({ eventId, event }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<SavedEventWithEventResponse[]>(queryKey);
      queryClient.setQueryData<SavedEventWithEventResponse[]>(queryKey, (current) => {
        if (!event || current?.some((saved) => saved.event_id === eventId)) {
          return current ?? [];
        }
        return [
          {
            id: `optimistic-${eventId}`,
            user_id: profile?.id ?? "",
            event_id: eventId,
            created_at: new Date().toISOString(),
            event,
          },
          ...(current ?? []),
        ];
      });
      return { previous };
    },
    onError: (_error, _eventId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const unsave = useMutation({
    mutationFn: async (eventId: string) => {
      if (!token || !profile) throw new Error("Sign in before updating saved events.");
      try {
        await api.saved.unsave(token, eventId);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return;
        throw error;
      }
    },
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<SavedEventWithEventResponse[]>(queryKey);
      queryClient.setQueryData<SavedEventWithEventResponse[]>(queryKey, (current) => {
        return (current ?? []).filter((saved) => saved.event_id !== eventId);
      });
      return { previous };
    },
    onError: (_error, _eventId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    save,
    unsave,
    pending: save.isPending || unsave.isPending,
  };
}
