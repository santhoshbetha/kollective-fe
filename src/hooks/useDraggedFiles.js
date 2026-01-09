import { useCallback, useEffect, useState } from 'react';

/** Controls the state of files being dragged over a node. */
function useDraggedFiles(node, onDrop) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDocumentDragEnter = useCallback((e) => {
    if (isDraggingFiles(e)) {
      setIsDragging(true);
    }
  }, []);

  const handleDocumentDragLeave = useCallback((e) => {
    if (isDraggedOffscreen(e)) {
      setIsDragging(false);
    }
  }, []);

  const handleDocumentDrop = useCallback((e) => {
    setIsDragging(false);
    setIsDraggedOver(false);
  }, []);

  const handleDragEnter = useCallback((e) => {
    if (isDraggingFiles(e)) {
      setIsDraggedOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!node.current || isDraggedOutOfNode(e, node.current)) {
      setIsDraggedOver(false);
    }
  }, [node]);

  const handleDrop = useCallback((e) => {
    if (isDraggingFiles(e) && onDrop) {
      onDrop(e.dataTransfer.files);
    }
    setIsDragging(false);
    setIsDraggedOver(false);
    e.preventDefault();
  }, [onDrop]);

  useEffect(() => {
    document.addEventListener('dragenter', handleDocumentDragEnter);
    document.addEventListener('dragleave', handleDocumentDragLeave);
    document.addEventListener('drop', handleDocumentDrop);
    return () => {
      document.removeEventListener('dragenter', handleDocumentDragEnter);
      document.removeEventListener('dragleave', handleDocumentDragLeave);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, [handleDocumentDragEnter, handleDocumentDragLeave, handleDocumentDrop]);

  const el = node && node.current;

  useEffect(() => {
    // Capture the current element so we don't rely on `node` ref identity
    if (!el) return undefined;

    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);
    return () => {
      el.removeEventListener('dragenter', handleDragEnter);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, [el, handleDragEnter, handleDragLeave, handleDrop]);

  return {
    /** Whether the document is being dragged over. */
    isDragging,
    /** Whether the node is being dragged over. */
    isDraggedOver,
  };
}

/** Ensure only files are being dragged, and not eg highlighted text. */
function isDraggingFiles(e) {
  if (e.dataTransfer) {
    const { types } = e.dataTransfer;
    return types.length === 1 && types[0] === 'Files';
  } else {
    return false;
  }
}

/** Check whether the cursor is in the screen. Mostly useful for dragleave events. */
function isDraggedOffscreen(e) {
  return e.screenX === 0 && e.screenY === 0;
}

/** Check whether the cursor is dragged out of the node. */
function isDraggedOutOfNode(e, node) {
  return !node.contains(document.elementFromPoint(e.clientX, e.clientY));
}

export { useDraggedFiles };