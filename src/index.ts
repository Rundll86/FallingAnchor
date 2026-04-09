import { Lexer, Parser } from "./compiler";
import { Runtime } from "./runtime";
import { Program } from "./compiler/parser/ast";

export class FallingAnchor {
    private runtime: Runtime;

    constructor() {
        this.runtime = new Runtime();
    }

    run(source: string): void {
        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();

        const parser = new Parser();
        const ast: Program = parser.parse(tokens);

        this.runtime.execute(ast);
    }
}

export { Lexer, Parser, Runtime };
export * from "./compiler/parser/token";
export * from "./compiler/parser/ast";
