import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classesService } from "../services/classes.service";
import { classesKeys } from "../query-keys";
import type { AssignMentorInput } from "../types";

export function useClasses() {
  return useQuery({
    queryKey: classesKeys.list(),
    queryFn: () => classesService.list(),
  });
}

export function useAssignMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, input }: { classId: number; input: AssignMentorInput }) =>
      classesService.assignMentor(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classesKeys.all });
    },
  });
}
