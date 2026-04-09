export enum NodeType {
    PROGRAM = "Program",
    HOOK_STATEMENT = "HookStatement",
    HOOK_PULLOUT_STATEMENT = "HookPulloutStatement",
    FUNCTION_DEFINITION = "FunctionDefinition",
    VARIABLE_DECLARATION = "VariableDeclaration",
    WHILE_STATEMENT = "WhileStatement",
    EXPRESSION_STATEMENT = "ExpressionStatement",
    FUNCTION_CALL = "FunctionCall",
    MEMBER_ACCESS = "MemberAccess",
    TYPE_CAST = "TypeCast",
    BINARY_EXPRESSION = "BinaryExpression",
    IDENTIFIER = "Identifier",
    NUMBER_LITERAL = "NumberLiteral",
    STRING_LITERAL = "StringLiteral",
}

export type Type = "int" | "string" | "void";

export interface ASTNode {
    type: NodeType;
}

export interface Program extends ASTNode {
    type: NodeType.PROGRAM;
    body: ASTNode[];
}

export interface HookStatement extends ASTNode {
    type: NodeType.HOOK_STATEMENT;
    moduleName: string;
}

export interface HookPulloutStatement extends ASTNode {
    type: NodeType.HOOK_PULLOUT_STATEMENT;
    moduleName: string;
    symbols: string[];
}

export interface FunctionDefinition extends ASTNode {
    type: NodeType.FUNCTION_DEFINITION;
    name: string;
    params: { name: string; paramType: Type }[];
    returnType: Type;
    body: ASTNode[];
    exported: boolean;
}

export interface VariableDeclaration extends ASTNode {
    type: NodeType.VARIABLE_DECLARATION;
    name: string;
    varType: Type;
    initializer: Expression;
}

export interface WhileStatement extends ASTNode {
    type: NodeType.WHILE_STATEMENT;
    condition: Expression;
    body: ASTNode[];
}

export interface ExpressionStatement extends ASTNode {
    type: NodeType.EXPRESSION_STATEMENT;
    expression: Expression;
}

export interface FunctionCall extends ASTNode {
    type: NodeType.FUNCTION_CALL;
    callee: Expression;
    arguments: Expression[];
}

export interface MemberAccess extends ASTNode {
    type: NodeType.MEMBER_ACCESS;
    object: Expression;
    property: string;
}

export interface TypeCast extends ASTNode {
    type: NodeType.TYPE_CAST;
    expression: Expression;
    targetType: Type;
}

export interface BinaryExpression extends ASTNode {
    type: NodeType.BINARY_EXPRESSION;
    left: Expression;
    operator: string;
    right: Expression;
}

export interface Identifier extends ASTNode {
    type: NodeType.IDENTIFIER;
    name: string;
}

export interface NumberLiteral extends ASTNode {
    type: NodeType.NUMBER_LITERAL;
    value: number;
}

export interface StringLiteral extends ASTNode {
    type: NodeType.STRING_LITERAL;
    value: string;
}

export type Expression =
    | FunctionCall
    | MemberAccess
    | TypeCast
    | BinaryExpression
    | Identifier
    | NumberLiteral
    | StringLiteral;
