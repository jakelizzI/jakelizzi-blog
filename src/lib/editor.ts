export function setupMarkdownEditor() {
  const el = document.getElementById("content");
  if (!el || !(el instanceof HTMLTextAreaElement)) return;

  const contentInput = el;
  if (contentInput.dataset.editorInit) return;
  contentInput.dataset.editorInit = "true";

  contentInput.addEventListener("keydown", (e) => {
    // Tab / Shift+Tab キーの挙動をスペース2文字のインデント操作に変更
    if (e.key === "Tab") {
      e.preventDefault();
      const start = contentInput.selectionStart;
      const end = contentInput.selectionEnd;
      const value = contentInput.value;

      if (e.shiftKey) {
        // Shift+Tab: 現在の行の先頭からスペースを最大2つ削除
        const lineStart = value.substring(0, start).lastIndexOf("\n") + 1;
        const lineText = value.substring(lineStart);

        let spacesToRemove = 0;
        if (lineText.startsWith("  ")) {
          spacesToRemove = 2;
        } else if (lineText.startsWith(" ")) {
          spacesToRemove = 1;
        }

        if (spacesToRemove > 0) {
          contentInput.value =
            value.substring(0, lineStart) + value.substring(lineStart + spacesToRemove);
          // カーソル位置を調整（行頭より前にはいかないようにする）
          contentInput.selectionStart = contentInput.selectionEnd = Math.max(
            lineStart,
            start - spacesToRemove
          );
          contentInput.dispatchEvent(new Event("input"));
        }
      } else {
        // 通常のTab: カーソル位置にスペース2文字を挿入
        contentInput.value = value.substring(0, start) + "  " + value.substring(end);
        contentInput.selectionStart = contentInput.selectionEnd = start + 2;
        contentInput.dispatchEvent(new Event("input"));
      }
    }

    // Enterキーで箇条書きの自動挿入
    if (e.key === "Enter") {
      const start = contentInput.selectionStart;
      const end = contentInput.selectionEnd;
      const value = contentInput.value;

      // カーソル位置の行を取得
      const textBeforeCursor = value.substring(0, start);
      const lastLineStart = textBeforeCursor.lastIndexOf("\n") + 1;
      const lastLine = textBeforeCursor.substring(lastLineStart);

      // 行頭のインデントとリストマーカーを個別にキャプチャ
      const match = lastLine.match(/^(\s*)([-*])\s+/);

      if (match) {
        e.preventDefault();
        const indent = match[1];
        const bullet = match[2];
        const prefix = `${indent}${bullet} `;

        // 空の箇条書き（マーカーのみ）でEnterを押した場合は、リストを解除して改行する
        if (lastLine.trim() === bullet) {
          contentInput.value = value.substring(0, lastLineStart) + "\n" + value.substring(end);
          // カーソルを改行の直後に設定
          contentInput.selectionStart = contentInput.selectionEnd = lastLineStart + 1;
        } else {
          // 通常のリスト継続
          contentInput.value = value.substring(0, start) + "\n" + prefix + value.substring(end);
          contentInput.selectionStart = contentInput.selectionEnd = start + 1 + prefix.length;
        }

        contentInput.dispatchEvent(new Event("input"));
      }
    }
  });
}
