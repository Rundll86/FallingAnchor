# 编程语言实现规范

## Why
需要一个模块化、解耦的编程语言架构，将词法分析（Lexer）、语法分析（Compiler）和运行时（Runtime）分离，各模块不负责读取源代码，只负责执行其对应功能。

## What Changes
- 新增 Lexer 模块：负责词法分析，将源代码字符串转换为 Token 序列
- 新增 Compiler 模块：负责语法分析，将 Token 序列编译为 AST
- 新增 Runtime 模块：负责从根节点 AST 执行模块
- 解耦设计：各模块通过接口通信，不直接依赖源代码读取
- 新增 AST 节点类型定义

## Impact
- 新增模块：Lexer、Compiler、Runtime
- 新增核心文件：AST 节点定义、Token 定义

## 语言语法分析

### 关键字与符号
| 符号 | 用途 |
|------|------|
| `hook "module"` | 导入整个模块 |
| `hook "module" pullout symbol1,symbol2` | 从模块导入指定符号 |
| `var <type> <name>=<expr>` | 变量声明 |
| `$ define <retType> <name>(<params>){}` | 函数定义（$ 表示导出） |
| `while(<cond>){}` | while 循环 |
| `->` | 类型转换运算符 |
| `.` | 成员访问运算符（classpath 风格，如 `stdout.write`） |

### 示例代码
```fa
hook "stdout";

var int i=0;
while(i<10){
    stdout.write(i -> string);
}
```

## ADDED Requirements

### Requirement: Token 定义
系统 SHALL 提供 Token 类型定义。

| Token 类型 | 说明 |
|------------|------|
| HOOK | hook 关键字 |
| PULLOUT | pullout 关键字 |
| VAR | var 关键字 |
| WHILE | while 关键字 |
| DEFINE | define 关键字 |
| DOLLAR | $ 符号 |
| IDENT | 标识符 |
| STRING | 字符串字面量 |
| NUMBER | 数字字面量 |
| TYPE_INT | int 类型 |
| TYPE_STRING | string 类型 |
| TYPE_VOID | void 类型 |
| LPAREN | ( |
| RPAREN | ) |
| LBRACE | { |
| RBRACE | } |
| SEMICOLON | ; |
| COMMA | , |
| ASSIGN | = |
| LT | < |
| ARROW | -> (类型转换) |
| DOT | . (成员访问) |

### Requirement: Lexer 词法分析器
系统 SHALL 提供词法分析功能，将源代码字符串转换为 Token 数组。

#### Scenario: 基础词法分析
- **WHEN** 输入 `"var int x = 42;"`
- **THEN** 返回 `[Token(VAR, "var"), Token(TYPE_INT, "int"), Token(IDENT, "x"), Token(ASSIGN, "="), Token(NUMBER, "42"), Token(SEMICOLON, ";")]`

#### Scenario: 类型转换表达式
- **WHEN** 输入 `"i -> string"`
- **THEN** 返回 `[Token(IDENT, "i"), Token(ARROW, "->"), Token(TYPE_STRING, "string")]`

#### Scenario: 成员访问调用
- **WHEN** 输入 `"stdout.write(x)"`
- **THEN** 返回 `[Token(IDENT, "stdout"), Token(DOT, "."), Token(IDENT, "write"), Token(LPAREN, "("), Token(IDENT, "x"), Token(RPAREN, ")")]`

### Requirement: AST 节点类型
系统 SHALL 提供完整的 AST 节点类型定义。

| 节点类型 | 说明 | 字段 |
|----------|------|------|
| Program | 程序根节点 | body: Statement[] |
| HookStatement | 模块导入语句 | moduleName: string |
| HookPulloutStatement | 模块符号导入 | moduleName: string, symbols: string[] |
| FunctionDefinition | 函数定义 | name: string, params: Param[], returnType: Type, body: Statement[], exported: boolean |
| VariableDeclaration | 变量声明 | name: string, varType: Type, initializer: Expression |
| WhileStatement | while 循环 | condition: Expression, body: Statement[] |
| FunctionCall | 函数调用 | callee: Expression, arguments: Expression[] |
| MemberAccess | 成员访问 | object: Expression, property: string |
| TypeCast | 类型转换 | expression: Expression, targetType: Type |
| BinaryExpression | 二元表达式 | left: Expression, operator: string, right: Expression |
| Identifier | 标识符 | name: string |
| NumberLiteral | 数字字面量 | value: number |
| StringLiteral | 字符串字面量 | value: string |

### Requirement: Compiler 语法分析器
系统 SHALL 提供语法分析功能，将 Token 数组编译为 AST。

#### Scenario: 解析 hook 语句
- **WHEN** 输入 `[Token(HOOK, "hook"), Token(STRING, "stdout"), Token(SEMICOLON, ";")]`
- **THEN** 返回 `AST(HookStatement, {moduleName: "stdout"})`

#### Scenario: 解析成员访问函数调用
- **WHEN** 输入 `[Token(IDENT, "stdout"), Token(MEMBER_ACCESS, "->>"), Token(IDENT, "write"), Token(LPAREN, "("), Token(IDENT, "x"), Token(RPAREN, ")"), Token(SEMICOLON, ";")]`
- **THEN** 返回 `AST(ExpressionStatement, {expression: AST(FunctionCall, {callee: AST(MemberAccess, {object: Identifier("stdout"), property: "write"}), arguments: [Identifier("x")]})}`

#### Scenario: 解析类型转换参数
- **WHEN** 解析 `"stdout.write(i -> string)"`
- **THEN** FunctionCall 的 arguments[0] 为 `AST(TypeCast, {expression: Identifier("i"), targetType: TYPE_STRING})`

### Requirement: Runtime 运行时
系统 SHALL 提供运行时执行功能，从 AST 根节点开始执行模块。

#### Scenario: 执行变量声明
- **WHEN** 执行 `AST(VariableDeclaration, {name: "i", varType: TYPE_INT, initializer: NumberLiteral(0)})`
- **THEN** 环境中变量 i 的值为 0

#### Scenario: 执行函数调用
- **WHEN** 执行 `AST(FunctionCall, {callee: MemberAccess(Identifier("stdout"), "write"), arguments: [StringLiteral("hello")]})`
- **THEN** 调用 stdout.write("hello")

#### Scenario: 执行类型转换表达式
- **WHEN** 执行 `AST(TypeCast, {expression: NumberLiteral(42), targetType: TYPE_STRING})`
- **THEN** 返回字符串 "42"

### Requirement: 模块解耦
各模块 SHALL 通过接口进行通信，不直接依赖源代码读取。

| 模块 | 输入 | 输出 | 职责 |
|------|------|------|------|
| Lexer | 源代码字符串 | Token[] | 字符过滤、Token 识别 |
| Compiler | Token[] | AST (Program) | 语法分析、AST 构建 |
| Runtime | AST (Program) | 执行结果 | 遍历执行 AST |

## Architecture

```
源代码字符串
    |
    v
+----------------+
|     Lexer      |  (Tokenize: string -> Token[])
+----------------+
    |
    v
+----------------+
|   Compiler     |  (Parse: Token[] -> AST)
+----------------+
    |
    v
+----------------+
|    Runtime     |  (Execute: AST -> Result)
+----------------+
```

## REMOVED Requirements
无
