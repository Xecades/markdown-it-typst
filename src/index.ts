import typst from "./typst.js";
import type { PluginWithOptions } from "markdown-it";

export const defaultTypstWrapper = (code: string) =>
    "#set page(width: auto, height: auto, margin: 5pt)\n" +
    "#set text(size: 18pt)\n" +
    code;

export const defaultSvgWrapper = (svg: string) =>
    '<div class="typst">\n' + svg + "\n</div>";

export interface MarkdownItTypstOptions {
    /**
     * The language identifier(s) of the Typst code block.
     *
     * @default "typst"
     */
    identifier?: string | string[];

    /**
     * A function that wraps the Typst code.
     *
     * @param code - Typst code
     * @returns Wrapped Typst code
     *
     * @default (code) => `#set page(width: auto, height: auto, margin: 5pt)\n#set text(size: 18pt)\n${code}`
     */
    typstWrapper?: (code: string) => string;

    /**
     * A function that wraps the compiled SVG document.
     *
     * @param svg - SVG document
     * @returns Wrapped SVG document
     *
     * @default (svg) => `<div class="typst">\n${svg}\n</div>`
     */
    svgWrapper?: (svg: string) => string;
}

/** `markdown-it-typst` plugin. */
const MarkdownItTypst: PluginWithOptions<MarkdownItTypstOptions> = (
    md,
    options = {}
) => {
    const {
        identifier = "typst",
        typstWrapper = defaultTypstWrapper,
        svgWrapper = defaultSvgWrapper,
    } = options;

    md.core.ruler.after("block", "typst", (state) => {
        for (let i = 0; i < state.tokens.length; i++) {
            const token = state.tokens[i];

            if (token.type !== "fence") {
                continue;
            }

            const isTypst =
                typeof identifier === "string"
                    ? token.info === identifier
                    : identifier.includes(token.info);

            if (!isTypst) {
                continue;
            }

            token.type = "typst";
        }
    });

    md.renderer.rules.typst = (tokens, idx, opts, env, self) => {
        const code = typstWrapper(tokens[idx].content);
        const svg = typst(code);

        return svgWrapper(svg) + "\n";
    };
};

export default MarkdownItTypst;
