import { useMutation, useQueryClient } from "@tanstack/react-query";
import { facultyFilesService } from "../services/faculty-files.service";
import { facultyKeys } from "../query-keys";

export function useUploadFacultyPhoto(facultyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => facultyFilesService.uploadPhoto(facultyId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facultyKeys.detail(facultyId) }),
  });
}

export function useRemoveFacultyPhoto(facultyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => facultyFilesService.removePhoto(facultyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facultyKeys.detail(facultyId) }),
  });
}

export function useUploadFacultyDocument(facultyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) =>
      facultyFilesService.uploadDocument(facultyId, file, documentType),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facultyKeys.documents(facultyId) }),
  });
}

export function useDeleteFacultyDocument(facultyId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => facultyFilesService.deleteDocument(facultyId, documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: facultyKeys.documents(facultyId) }),
  });
}
