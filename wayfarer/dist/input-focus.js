/** Editing and interface controls own their keyboard events, including nested children. */
export function isInteractiveInputTarget(target) {
    if (!target || typeof target !== 'object' || !('closest' in target) || typeof target.closest !== 'function')
        return false;
    return !!target.closest('input,select,textarea,button,summary,a,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="combobox"]');
}
