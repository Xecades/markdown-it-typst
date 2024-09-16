import { expect, it } from "vitest";

import MarkdownItTypst from "../src/index.js";
import MarkdownIt from "markdown-it";

it("should install correctly", () => {
    const md = MarkdownIt().use(MarkdownItTypst);
    expect(md).toBeDefined();
});

it("should not interrupt normal code blocks", () => {
    const tests = [
        [
            "**Bold Text**\n\n" + "```\n```\n\n" + "\n```\n```\n",
            `<p><strong>Bold Text</strong></p>\n<pre><code></code></pre>\n<pre><code></code></pre>\n`,
        ],
        [
            "```js\nconsole.log('Hello!');\n```",
            `<pre><code class="language-js">console.log('Hello!');\n</code></pre>\n`,
        ],
        [
            "text\n\n" + '```c\nprintf("Hello World!");\n```\n\n' + "text",
            '<p>text</p>\n<pre><code class="language-c">printf(&quot;Hello World!&quot;);\n</code></pre>\n<p>text</p>\n',
        ],
    ];

    const md = MarkdownIt().use(MarkdownItTypst);

    for (const [input, expected] of tests) {
        expect(md.render(input)).toBe(expected);
    }
});

it("should render Typst code", () => {
    const tests = [
        "```typst\nHello,\nworld!\n```",
        "```typst\n$e ^ (i pi) + 1 = 0$\n```",
    ];

    const md = MarkdownIt().use(MarkdownItTypst);

    for (const input of tests) {
        expect(md.render(input)).toMatchSnapshot();
    }
});

it("should be able to import packages", () => {
    const md = MarkdownIt().use(MarkdownItTypst);

    const code =
        "```typst\n" +
        `#import "@preview/cetz:0.2.2": canvas, draw, tree\n` +
        `#canvas(length: 2.5cm, {\n` +
        `    import draw: *\n` +
        `    tree.tree(\n` +
        `        draw-node: (node, ..) => {\n` +
        `            if node.content == [] { return none }\n` +
        `            circle((), radius: .35, stroke: black)\n` +
        `            content((), [#node.content])\n` +
        `        },\n` +
        `        draw-edge: (from, to, pa, child) => {\n` +
        `            if child.content == [] { return none }\n` +
        `            tree.default-draw-edge(from, to, pa, child)\n` +
        `        },\n` +
        `        ([15], ([13], [12], [14]), ([17], [16], ([18], [], [18])))\n` +
        `    )\n` +
        `})\n` +
        "```";

    expect(md.render(code)).toMatchSnapshot();
});

it("should handle `identifier` option correctly", () => {
    const md = MarkdownIt().use(MarkdownItTypst, { identifier: "test" });

    expect(md.render("```typst\nHello,\nworld!\n```")).toMatchInlineSnapshot(`
      "<pre><code class="language-typst">Hello,
      world!
      </code></pre>
      "
    `);
    expect(md.render("```test\nHello,\nworld!\n```")).toMatchSnapshot();
});

it("should handle `typstWrapper` option correctly", () => {
    const md1 = MarkdownIt().use(MarkdownItTypst, {
        typstWrapper: (code) => code,
    });

    const result1 = md1.render("```typst\nHello, world!\n```");

    const md2 = MarkdownIt().use(MarkdownItTypst, {
        typstWrapper: (code) => `Hello, ${code}`,
    });

    const result2 = md2.render("```typst\nworld!\n```");

    expect(result1).toEqual(result2);
});

it("should handle `svgWrapper` option correctly", () => {
    const md1 = MarkdownIt().use(MarkdownItTypst, {
        svgWrapper: (svg) => svg,
    });

    const result1 = md1.render("```typst\nHello, world!\n```");

    const md2 = MarkdownIt().use(MarkdownItTypst, {
        svgWrapper: (svg) => `<TypstSVG>${svg}</TypstSVG>`,
    });

    const result2 = md2.render("```typst\nHello, world!\n```");

    expect(`<TypstSVG>${result1.trimEnd()}</TypstSVG>\n`).toEqual(result2);
});
