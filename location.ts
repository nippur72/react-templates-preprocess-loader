interface CheerioElement {
   startIndex: number;
}

interface SourcePosition {
   line: number;
   col: number;
}

/**
 * @param {string} html
 * @param node
 * @return {Pos}
 */
function getLine(html: string, node: CheerioElement): SourcePosition {
    if (!node) {
        return {line: 1, col: 1};
    }
    const linesUntil = html.substring(0, node.startIndex).split("\n");
    return {line: linesUntil.length, col: linesUntil[linesUntil.length - 1].length + 1};
}

/**
 * @param context
 * @param node
 * @return {{pos:Pos, start:number, end:number}}
 */
function getNodeLoc(context, node) {
    const pos = getLine(context.html, node);
    let end;
    if (node.data) {
        end = node.startIndex + node.data.length;
    } else if (node.next) { // eslint-disable-line
        end = node.next.startIndex;
    } else {
        end = context.html.length;
    }
    return {
        pos: pos,
        start: node.startIndex,
        end: end
    };
}

export { getLine, getNodeLoc };