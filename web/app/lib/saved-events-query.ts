import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api } from "~/lib/api";
import { useAuth } from "~/lib/auth";

type SavedEventIds = Set<string>;

const emptySavedEventIds = new Set<string>();

function savedEventsQueryKey(userId: string | null | undefined) {
  return ["saved-events", userId ?? "anonymous"] as const;
}

function savedEventDetailsQueryKey(eventIds: string[]) {
  return ["saved-event-details", ...eventIds] as const;
}

export function useSavedEventIds() {
  const { token, profile } = useAuth();

  const query = useQuery({
    queryKey: savedEventsQueryKey(profile?.id),
    queryFn: async () => {
      if (!token || !profile) return emptySavedEventIds;
      const data = await api.saved.list(token);
      return new Set(data.saved_events.map((saved) => saved.event_id));
    },
    enabled: Boolean(token && profile),
  });

  return {
    ...query,
    data: query.data ?? emptySavedEventIds,
  };
}

export function useSavedEventDetails() {
  const savedIdsQuery = useSavedEventIds();
  const eventIds = [...savedIdsQuery.data];

  const detailsQuery = useQuery({
    queryKey: savedEventDetailsQueryKey(eventIds),
    queryFn: () => Promise.all(eventIds.map((eventId) => api.events.get(eventId))),
    enabled: !savedIdsQuery.isLoading && eventIds.length > 0,
  });

  return {
    ...detailsQuery,
    data: detailsQuery.data ?? [],
    isLoading: savedIdsQuery.isLoading || detailsQuery.isLoading,
    error: savedIdsQuery.error ?? detailsQuery.error,
  };
}

export function useSavedEventMutations() {
  const { token, profile } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = savedEventsQueryKey(profile?.id);

  const save = useMutation({
    mutationFn: async (eventId: string) => {
      if (!token || !profile) throw new Error("Sign in before saving events.");
      await api.saved.save(token, eventId);
    },
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<SavedEventIds>(queryKey);
      queryClient.setQueryData<SavedEventIds>(queryKey, (current) => {
        const next = new Set(current ?? []);
        next.add(eventId);
        return next;
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
      const previous = queryClient.getQueryData<SavedEventIds>(queryKey);
      queryClient.setQueryData<SavedEventIds>(queryKey, (current) => {
        const next = new Set(current ?? []);
        next.delete(eventId);
        return next;
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
