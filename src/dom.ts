export function setDocumentPointerStyle(style: string) {
  document.body.style.cursor = style;
}
export function setCanvasPointerStyle(
  canvas: HTMLCanvasElement,
  style: string
) {
  canvas.style.cursor = style;
}
