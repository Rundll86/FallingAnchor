import {
    NodeType,
    Program,
    HookStatement,
    HookPulloutStatement,
    FunctionDefinition,
    VariableDeclaration,
    WhileStatement,
    ExpressionStatement,
    FunctionCall,
    MemberAccess,
    TypeCast,
    BinaryExpression,
    Identifier,
    NumberLiteral,
    StringLiteral,
    Expression,
    ASTNode,
} from "../compiler/parser/ast";

type RuntimeValue = number | string | null;

export class Runtime {
    private environment: Map<string, RuntimeValue> = new Map();
    private modules: Map<string, Record<string, (...args: RuntimeValue[]) => RuntimeValue>> = new Map();
    private functions: Map<string, FunctionDefinition> = new Map();

    constructor() {
        this.setupBuiltinModules();
    }

    private setupBuiltinModules(): void {
        this.modules.set("stdout", {
            write: (...args: RuntimeValue[]) => {
                console.log(args.join(""));
                return null;
            },
        });
    }

    execute(program: Program): void {
        for (const node of program.body) {
            this.executeNode(node);
        }
    }

    private executeNode(node: ASTNode): RuntimeValue {
        switch (node.type) {
            case NodeType.HOOK_STATEMENT:
                return this.executeHookStatement(node as HookStatement);
            case NodeType.HOOK_PULLOUT_STATEMENT:
                return this.executeHookPulloutStatement(node as HookPulloutStatement);
            case NodeType.VARIABLE_DECLARATION:
                return this.executeVariableDeclaration(node as VariableDeclaration);
            case NodeType.WHILE_STATEMENT:
                return this.executeWhileStatement(node as WhileStatement);
            case NodeType.EXPRESSION_STATEMENT:
                return this.executeExpressionStatement(node as ExpressionStatement);
            case NodeType.FUNCTION_DEFINITION:
                return this.executeFunctionDefinition(node as FunctionDefinition);
            default:
                return null;
        }
    }

    private executeHookStatement(node: HookStatement): RuntimeValue {
        return null;
    }

    private executeHookPulloutStatement(node: HookPulloutStatement): RuntimeValue {
        return null;
    }

    private executeVariableDeclaration(node: VariableDeclaration): RuntimeValue {
        const value = this.evaluateExpression(node.initializer);
        this.environment.set(node.name, value);
        return value;
    }

    private executeWhileStatement(node: WhileStatement): RuntimeValue {
        while (this.isTruthy(this.evaluateExpression(node.condition))) {
            for (const stmt of node.body) {
                this.executeNode(stmt);
            }
        }
        return null;
    }

    private executeExpressionStatement(node: ExpressionStatement): RuntimeValue {
        return this.evaluateExpression(node.expression);
    }

    private executeFunctionDefinition(node: FunctionDefinition): RuntimeValue {
        this.functions.set(node.name, node);
        return null;
    }

    private evaluateExpression(expr: Expression): RuntimeValue {
        switch (expr.type) {
            case NodeType.NUMBER_LITERAL:
                return (expr as NumberLiteral).value;
            case NodeType.STRING_LITERAL:
                return (expr as StringLiteral).value;
            case NodeType.IDENTIFIER:
                return this.evaluateIdentifier(expr as Identifier);
            case NodeType.BINARY_EXPRESSION:
                return this.evaluateBinaryExpression(expr as BinaryExpression);
            case NodeType.FUNCTION_CALL:
                return this.evaluateFunctionCall(expr as FunctionCall);
            case NodeType.MEMBER_ACCESS:
                return this.evaluateMemberAccess(expr as MemberAccess);
            case NodeType.TYPE_CAST:
                return this.evaluateTypeCast(expr as TypeCast);
            default:
                return null;
        }
    }

    private evaluateIdentifier(ident: Identifier): RuntimeValue {
        return this.environment.get(ident.name) ?? null;
    }

    private evaluateBinaryExpression(expr: BinaryExpression): RuntimeValue {
        const left = this.evaluateExpression(expr.left);
        const right = this.evaluateExpression(expr.right);

        if (typeof left === "number" && typeof right === "number") {
            switch (expr.operator) {
                case "+":
                    return left + right;
                case "-":
                    return left - right;
                case "*":
                    return left * right;
                case "/":
                    return left / right;
                case "<":
                    return left < right ? 1 : 0;
                case ">":
                    return left > right ? 1 : 0;
            }
        }

        if (typeof left === "string" && typeof right === "string" && expr.operator === "+") {
            return left + right;
        }

        return null;
    }

    private evaluateFunctionCall(call: FunctionCall): RuntimeValue {
        const args = call.arguments.map((arg) => this.evaluateExpression(arg));

        if (call.callee.type === NodeType.MEMBER_ACCESS) {
            const memberAccess = call.callee as MemberAccess;
            const object = this.evaluateExpression(memberAccess.object);

            if (typeof object === "object" && object !== null) {
                const fn = (object as Record<string, (...args: RuntimeValue[]) => RuntimeValue>)[memberAccess.property];
                if (fn) {
                    return fn(...args);
                }
            }

            if (typeof object === "string" && memberAccess.property === "toString") {
                return object;
            }
        }

        if (call.callee.type === NodeType.IDENTIFIER) {
            const ident = call.callee as Identifier;
            const module = this.modules.get(ident.name);
            if (module) {
                const fn = module[ident.name];
                if (fn) {
                    return fn(...args);
                }
            }
        }

        return null;
    }

    private evaluateMemberAccess(access: MemberAccess): RuntimeValue {
        const object = this.evaluateExpression(access.object);

        if (typeof object === "object" && object !== null) {
            return (object as Record<string, RuntimeValue>)[access.property] ?? null;
        }

        if (typeof object === "string") {
            if (access.property === "length") {
                return object.length;
            }
        }

        return null;
    }

    private evaluateTypeCast(cast: TypeCast): RuntimeValue {
        const value = this.evaluateExpression(cast.expression);

        if (cast.targetType === "string") {
            return String(value);
        }

        if (cast.targetType === "int") {
            return parseInt(String(value), 10);
        }

        return value;
    }

    private isTruthy(value: RuntimeValue): boolean {
        if (value === null) return false;
        if (typeof value === "number") return value !== 0;
        if (typeof value === "string") return value !== "";
        return true;
    }
}
