import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";

let compiler: NodeCompiler;

/**
 * Compile Typst code to SVG.
 *
 * @param code - Typst code
 * @returns SVG document
 *
 * @see https://myriad-dreamin.github.io/typst.ts/cookery/guide/all-in-one-node.html
 */
export default (code: string): string => {
    if (!compiler) {
        compiler = NodeCompiler.create();
    } else {
        compiler.evictCache(10);
    }

    return compiler.svg({ mainFileContent: code });
};
