export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoking synchronously can race the download navigation in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
