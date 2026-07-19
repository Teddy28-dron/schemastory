# SchemaStory

> 没有正式 Schema，也能看清真实 JSON 结构是怎么变的。

[![CI](https://github.com/Teddy28-dron/schemastory/actions/workflows/ci.yml/badge.svg)](https://github.com/Teddy28-dron/schemastory/actions/workflows/ci.yml)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b82f6.svg)](LICENSE)

![SchemaStory 将两份 JSON 样本变成直观的结构变化报告](docs/assets/demo.svg)

SchemaStory 是一个本地优先的命令行工具。它直接比较两份 JSON、JSONL 或 NDJSON 样本，推断其中实际出现过的结构，标出破坏性变化和可疑漂移，并生成终端、JSON 或单文件 HTML 报告。报告不会包含原始值。

[English](README.md) · 简体中文

## 它解决什么问题

API、事件流、LLM 调用日志、数据导出和管道经常在正式 Schema 写好之前就发生变化。字段消失、字符串变成数组、原本每条都有的对象突然只剩 30% 的记录存在——通常等到下游报错，我们才发现。

SchemaStory 用现有样本把这些变化提前展示出来：

- **不要求已有 Schema：**直接比较 `.json`、`.jsonl`、`.ndjson` 文件；
- **结果可解释：**区分字段删除、类型变化、覆盖率下降、空值增长和新增字段；
- **报告可安全分享：**只保留路径、类型和比例等聚合信息，不输出原始值；
- **适合本地和 CI：**同时提供终端、稳定 JSON、自包含 HTML 和策略退出码；
- **足够轻：**运行时零依赖，无账号、无遥测、无网络请求。

## 30 秒上手

需要 Node.js 22 或更高版本。在 npm 包正式发布前，可以直接运行 GitHub 上的当前源码：

```bash
npx --yes github:Teddy28-dron/schemastory before.jsonl after.jsonl
```

生成并打开可视化报告：

```bash
npx --yes github:Teddy28-dron/schemastory before.jsonl after.jsonl --format html --output report.html --open
```

运行仓库内置 Demo：

```bash
git clone https://github.com/Teddy28-dron/schemastory.git
cd schemastory
npm install
npm run demo
```

然后打开 `examples/report.html`。

## 能发现哪些变化

假设旧记录是：

```json
{ "sessionId": "s-001", "message": { "content": "你好" }, "usage": { "inputTokens": 12 } }
```

新记录变成：

```json
{ "traceId": "t-001", "message": { "content": [{ "type": "text" }] }, "usage": null }
```

SchemaStory 会给出类似结果：

```text
BREAKING $.message.content
         Observed types changed from string to array.

BREAKING $.sessionId
         This previously observed path is absent from the after sample.

INFO     $.traceId
         This path was observed in the after sample only.
```

除了类型，它还会比较**记录覆盖率**（有多少条顶层记录包含该路径）和**空值比例**，因此能发现单个示例或传统 Schema diff 不容易表达的渐进式变化。

## 常见用法

本地查看变化：

```bash
schemastory export-before.json export-after.json
```

保存机器可读报告：

```bash
schemastory before.jsonl after.jsonl --format json --output drift.json
```

在 CI 中拦截破坏性变化：

```bash
schemastory fixture-v1.jsonl fixture-v2.jsonl --format json --fail-on breaking
```

默认 `--fail-on never`，发现变化也返回 `0`，适合探索。`--fail-on breaking` 在存在破坏性变化时返回 `1`；`--fail-on warning` 则同时拦截 warning 和 breaking。

调整采样和阈值：

```bash
schemastory before.jsonl after.jsonl \
  --max-records 50000 \
  --max-depth 30 \
  --coverage-threshold 0.10 \
  --null-threshold 0.15
```

## 命令行参数

```text
schemastory [options] <before.json|jsonl> <after.json|jsonl>

-f, --format <terminal|json|html>  输出格式，默认 terminal
-o, --output <path>               写入文件
    --max-records <number>        每份输入最多采样记录数，默认 10000
    --max-depth <number>          最大嵌套遍历深度，默认 20
    --coverage-threshold <0..1>   覆盖率下降阈值，默认 0.20
    --null-threshold <0..1>       空值比例增长阈值，默认 0.20
    --fail-on <breaking|warning|never>
                                   CI 失败策略，默认 never
    --open                        打开生成的 HTML 报告
    --no-color                    关闭 ANSI 颜色
-h, --help                        显示帮助
-v, --version                     显示版本
```

退出码：`0` 表示分析完成且策略通过，`1` 表示分析完成但命中 `--fail-on` 策略，`2` 表示参数、输入或输出错误。

## 默认判定规则

| 观察到的变化                    | 级别     |
| ------------------------------- | -------- |
| 原有路径完全消失                | Breaking |
| 原类型消失且不是安全拓宽        | Breaking |
| 原本几乎必有的路径变得稀疏      | Breaking |
| 出现新类型（包括开始允许 null） | Warning  |
| 覆盖率下降至少 20 个百分点      | Warning  |
| 空值比例上升至少 20 个百分点    | Warning  |
| 出现新路径                      | Info     |
| integer 拓宽为 number           | Info     |

规则完全确定且可审计，实现在 [`src/compare.js`](src/compare.js)。

## 隐私设计

SchemaStory 只在本地读取值来判断 JSON 类型和嵌套关系，报告只接收聚合后的结构信息。运行时代码没有网络请求、遥测、值预览或值哈希；HTML 报告也不引用任何外部资源。报告会显示输入文件的文件名，如果文件名本身敏感，请先使用中性名称。

## 边界与限制

- 比较的是样本中**观察到的结构**，不是对完整数据契约的证明；
- 不替代 JSON Schema、OpenAPI 或运行时验证；
- 不分析数值分布和业务语义变化；
- v0.1 不猜测重命名，重命名会显示为一次删除和一次新增；
- JSONL 逐行读取；普通 JSON 数组会整体载入内存，文件上限为 50 MiB；
- 默认最多采样 10,000 条记录、遍历 20 层、记录 5,000 个路径。

这些限制会在报告中明确展示。更多设计背景见 [架构说明](ARCHITECTURE.md)、[产品需求](PRD.md) 和 [路线图](ROADMAP.md)。

## 开发与贡献

```bash
npm install
npm test
npm run lint
npm run format:check
npm run test:coverage
```

欢迎提交 bug、真实匿名 fixture、规则讨论和文档改进。请先阅读 [贡献指南](CONTRIBUTING.md)、[行为准则](CODE_OF_CONDUCT.md) 和 [安全策略](SECURITY.md)。

如果 SchemaStory 帮你提前发现了一次数据破坏，欢迎给仓库一个 Star，并分享你的使用场景——这会直接决定下一版优先解决什么。

## 许可证

[MIT](LICENSE) © SchemaStory contributors.
