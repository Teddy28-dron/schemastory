# 100+ Stars 项目选题研究

> 状态：方向评审中，尚未编码  
> 调研日期：2026-07-19  
> 结论置信度：中等。已完成公开资料、官方文档、GitHub 仓库与公开 Issue 的桌面调研；尚未完成用户访谈、落地页转化测试和包名注册。

## 1. 当前仓库与开发环境

### 仓库现状

- 当前目录仅有 `AGENTS.md`，没有已有代码、包清单、测试、许可证或 Git 历史。
- 目标目录本身尚未初始化为 Git 仓库。
- 因而不存在需要兼容的既有架构，也没有需要保留的业务实现。

### 本机可用环境

| 能力               | 检查结果 | 对选型的影响                                         |
| ------------------ | -------: | ---------------------------------------------------- |
| Windows PowerShell |      5.1 | 必须认真验证 Windows 路径、进程和 shell 行为         |
| Git                |   2.50.1 | 可实现基于 revision、worktree 或 diff 的功能         |
| Node.js            |  24.11.1 | 适合做低安装门槛的跨平台 CLI，并可使用内置测试运行器 |
| npm                |   11.6.2 | 可以提供 `npx` 30 秒体验                             |
| Python             |   3.12.4 | 可作为数据类工具备选，但首次安装通常不如 `npx` 直接  |
| ripgrep            |   15.1.0 | 可用于本地检索和开发辅助，不应成为最终用户硬依赖     |
| Rust / Go / Docker |   未安装 | 第一版不选择需要这些工具才能开发或验证的方案         |

### 约束与机会

1. 第一版优先采用 Node.js 24、TypeScript/ESM、单进程 CLI、静态 HTML 输出。
2. 核心价值必须能用仓库内示例数据离线演示，不能依赖云端 Token 或付费 API。
3. Windows、macOS、Linux 的差异必须被测试；本机只能直接验证 Windows，其他系统交给 GitHub Actions。
4. 不把“使用 AI”当卖点。确定性、隐私、本地运行和清晰输出更容易建立信任。

## 2. 调研方法与证据边界

本轮使用以下信号判断需求是否真实：

- 是否存在被长期维护的工具，证明用户愿意为该问题安装软件；
- 是否存在公开 Issue 或讨论描述具体失败，而不是只有产品宣传；
- 现有方案是否要求预先建模、运行平台、安装重型环境或上传数据；
- 能否在一条命令后得到可截图、可分享的明显结果；
- 2026 年是否已经出现大量几乎同质的新项目。

发现的反例也会影响评分。例如，`.env` 漂移检查已经出现 `dotenvdrift`、EnvGuard、envgap、envsniff、envgrd 等近似实现；“分享前清洗日志”已有 ShareClean、LogShield、ScrubDuck；失败命令报告甚至已有同名定位的 FailPack。这些都是真需求，但不再是本项目最好的切入口。

研究局限：搜索结果不等于完整市场；“未搜到”不代表不存在。最终命名仍需在 GitHub、npm、商标数据库做发布前复核。活跃程度是截至调研日的快照，不应写成永久事实。

## 3. 十个候选项目

### 3.1 SchemaStory（推荐）

**一句话介绍：** 无需预先编写 Schema，用一条命令比较两批 JSON/JSONL 样本，生成隐私友好的结构漂移故事和独立 HTML 报告。

| 项目项           | 内容                                                                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目标用户         | API/后端开发者、数据工程师、AI 工具作者、维护非正式 JSONL 格式的开源项目                                                                                                                                        |
| 具体问题         | 上游悄悄删除字段、改变类型、提高空值率或改变数组元素形状；消费端往往在上线后才失败。很多真实数据并没有正式 JSON Schema。公开的 Claude Code Issue 就描述了 JSONL 升级后静默误解析，并明确要求对漂移“fail loud”。 |
| 典型场景         | 比较昨日与今日 API 抓取、旧版与新版导出文件、模型/Agent 两次结构化输出、迁移前后 JSONL                                                                                                                          |
| 当前替代方案     | `diff/jq`、dyff、JSON Schema diff、OpenAPI diff、YData Profiling、Evidently、whylogs、Great Expectations                                                                                                        |
| 现有方案不足     | 文本 diff 被值噪声淹没；Schema diff 要求用户已经有 Schema；数据质量/ML 漂移平台强大但安装和概念较重，主要面向表格、模型或长期监控                                                                               |
| 核心差异化       | 从真实嵌套样本推断“观察到的契约”，只输出路径、类型、出现率和空值率等聚合，不默认输出原始值；专注一次性的 before/after 结构审查                                                                                  |
| 最核心功能       | 对两个 JSON/JSONL 输入生成按 breaking / warning / info 分类的字段级漂移报告                                                                                                                                     |
| 可展示 Demo      | `npx schemastory before.jsonl after.jsonl` 后，终端从海量红绿行变成一张“3 breaking / 2 risky / 4 added”的树状卡片，并打开独立 HTML                                                                              |
| MVP              | JSON 数组与 JSONL；嵌套对象/数组形状推断；字段存在率、类型集合、空值率；严重度规则；终端/JSON/HTML；CI 退出码；示例数据                                                                                         |
| 明确不做         | 不做数据库连接、数据仓库、时间序列监控、ML 分布漂移、PII 检测、云 Dashboard、自动修改生产数据                                                                                                                   |
| 推荐技术栈       | Node.js 24 + TypeScript/ESM；尽量使用标准库；流式 JSONL；自包含 HTML/CSS/SVG；`node:test`                                                                                                                       |
| 实现难度         | 中等。难点在异构数组、union 类型、样本不足和严重度规则，而不是 UI                                                                                                                                               |
| 维护成本         | 中低。先只支持 JSON/JSONL；规则和输入适配器可独立扩展                                                                                                                                                           |
| 传播渠道         | Hacker News、r/dataengineering、r/node、r/opensource、DataTalksClub、MLOps/Data Engineering 社区、中文数据工程社区                                                                                              |
| 获得 Star 的理由 | 输入输出对比非常直观；“没有 Schema 也能发现 Schema 漂移”一句话可懂；离线且不泄露原始值；适合贴在 PR 和 Issue 中                                                                                                 |
| 主要失败风险     | 样本不能证明完整契约，若输出口吻过度确定会失去信任；YData/Evidently 已能比较数据集，必须保持“嵌套 JSON 结构、零配置、轻量 CI”边界                                                                               |

需求证据：[Claude Code JSONL 稳定 Schema 请求](https://github.com/anthropics/claude-code/issues/53516) 明确指出升级导致静默误解析；[Hugging Face Datasets #7322](https://github.com/huggingface/datasets/issues/7322) 展示异构对象被统一 Schema 后产生无意义空值并破坏下游；[Spark BigQuery Connector](https://github.com/GoogleCloudDataproc/spark-bigquery-connector) 文档也明确以类型不匹配阻止意外 Schema 漂移。

### 3.2 FirstRun

**一句话介绍：** 在干净临时工作区中执行 README 承诺的 Quick Start，并生成“新用户真的跑通了”的证据报告。

| 项目项           | 内容                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 目标用户         | 开源维护者、SDK/CLI 作者、开发者工具团队、技术写作者                                                                                                                |
| 具体问题         | README 安装命令、路径、版本号和输出会随代码变化而腐烂；维护者机器上的缓存和全局依赖会掩盖问题                                                                       |
| 典型场景         | Release 前验证 README 的 30 秒示例；PR 修改安装步骤后跑 CI；检查从零克隆到首次结果的总耗时                                                                          |
| 当前替代方案     | 手工复制粘贴、普通 smoke test、Runme、Doc Detective、mdsh、mktestdocs、pytest-codeblock                                                                             |
| 现有方案不足     | 通用 doctest 常限定语言；可执行 Markdown 工具强调交互/runbook；大型文档测试框架需要额外规格。它们通常不把“干净克隆的新用户旅程、步骤数、耗时、残留文件”作为一等输出 |
| 核心差异化       | 只验证显式标记的 Quick Start journey；状态化顺序执行；默认复制到临时目录；输出首次成功耗时和失败源行                                                                |
| 最核心功能       | 从 Markdown 中抽取 opt-in 命令块，在临时副本中顺序执行并验证退出码/期望输出                                                                                         |
| 可展示 Demo      | README 中故意使用过期命令，报告精确指向第几行并显示“用户会在第 2 步、18 秒处退出”                                                                                   |
| MVP              | Markdown 解析；bash/PowerShell/npm 命令适配；显式注释协议；超时；输出断言；JUnit/JSON/终端报告；GitHub Action 示例                                                  |
| 明确不做         | 不执行未标记的任意 README；不做完整容器沙箱；不做浏览器 UI 自动化；不自动改写文档                                                                                   |
| 推荐技术栈       | Node.js + TypeScript；子进程与临时目录用标准库；CommonMark 解析器作为少量依赖                                                                                       |
| 实现难度         | 中等。shell 安全、跨平台和状态共享需要谨慎设计                                                                                                                      |
| 维护成本         | 中等。shell 方言和包管理器持续变化，但 P0 可以只承诺明确支持矩阵                                                                                                    |
| 传播渠道         | Hacker News、r/opensource、Write the Docs、DevRel、SDK 与 CLI 维护者社区                                                                                            |
| 获得 Star 的理由 | 每位维护者都见过失效 README；失败截图极易理解；可直接作为 PR 检查                                                                                                   |
| 主要失败风险     | Runme 和 Doc Detective 已覆盖相邻需求；执行文档命令有安全风险，默认策略若不够保守会阻碍采用                                                                         |

需求证据：[GitHub 官方 README 指南](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) 强调 README 是访问者理解用途和入门方式的首要入口；[测试 Markdown 示例的实践说明](https://gist.github.com/szkiba/d9b7b4601efb7dc68aa2c58548b8b271) 直接指出文档示例会随时间变化，应该自动测试。

### 3.3 LockLens

**一句话介绍：** 把不可读的 lockfile diff 变成“哪个直接依赖带来了哪些传递变化、脚本与来源风险”的本地审查报告。

| 项目项           | 内容                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 目标用户         | JavaScript/TypeScript 仓库维护者、依赖更新 PR 审查者、DevSecOps 工程师                                                              |
| 具体问题         | 更新一个直接依赖可能带来大量传递依赖变化；审查者面对数千行 lockfile 往往只能跳过                                                    |
| 典型场景         | 本地审查 Renovate/Dependabot PR；比较两个 Git revision 的 npm/pnpm/yarn lockfile；识别新增 install script、Git URL 和 registry 变化 |
| 当前替代方案     | GitHub Dependency Review、dependency-review-action、lockfile-lint、包管理器 `why/list`、手工 diff                                   |
| 现有方案不足     | GitHub 的优秀体验绑定 PR/GitHub，私有仓库的部分能力有计划限制；lockfile-lint 偏策略而非解释；不同包管理器输出割裂                   |
| 核心差异化       | 完全本地、跨 npm/pnpm/yarn 的因果路径：`direct dependency -> transitive change -> review reason`，并输出独立 HTML                   |
| 最核心功能       | 从两个 revision 解析依赖图并解释新增、删除、升级和来源变化的最短引入路径                                                            |
| 可展示 Demo      | 4,000 行 `pnpm-lock.yaml` 变成 12 张可折叠卡片，突出一个新增安装脚本和一个 registry 变化                                            |
| MVP              | 先支持 package-lock v3 与 pnpm lock；Git revision/文件输入；传递路径；来源、integrity、script 信号；终端/HTML/JSON                  |
| 明确不做         | 不做漏洞数据库、恶意软件判定、自动升级、托管 PR Bot、所有语言生态                                                                   |
| 推荐技术栈       | Node.js + TypeScript；lockfile 解析适配器；Git CLI；自包含 HTML                                                                     |
| 实现难度         | 中高。不同 lockfile 版本、workspace、peer dependency 与 hoisting 语义复杂                                                           |
| 维护成本         | 中高。包管理器格式持续变化，必须用 fixture 和兼容矩阵管理                                                                           |
| 传播渠道         | Node.js、pnpm、npm、supply-chain security、DevSecOps 社区                                                                           |
| 获得 Star 的理由 | lockfile 噪声的 before/after 效果极强；供应链安全关注长期存在；可嵌入 PR                                                            |
| 主要失败风险     | GitHub 已提供成熟 Dependency Review；如果只做漂亮 diff 而没有可靠因果图，就不足以形成迁移理由                                       |

需求证据：[GitHub Dependency Review 文档](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review) 明确说明一次直接升级可能带来意外的传递依赖变化，并为此提供专门视图；[GitHub 的相关介绍](https://github.blog/security/supply-chain-security/shifting-supply-chain-security-left-with-dependency-review/) 直接描述 lockfile PR 难以人工阅读。

### 3.4 Cronboard

**一句话介绍：** 自动读取仓库中的 cron、GitHub Actions 和 Kubernetes CronJob，在一个本地日历里暴露时区错误、重叠和空窗。

| 项目项               | 内容                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 目标用户             | SRE、DevOps、数据工程师、小型自托管服务维护者                                                                       |
| 具体问题             | 多种调度配置散落在仓库里；UTC、本地时区、DST 和重叠执行难以靠肉眼判断                                               |
| 典型使用             | Release 前检查所有定时任务；合并两个团队的 schedule；查看未来 7/30 天高峰                                           |
| 当前替代             | crontab.guru、CronTool、平台 UI、手工换算、Cronicle                                                                 |
| 不足与差异化         | 在线工具通常要求逐条粘贴；本项目直接扫描仓库、标注来源行并聚合多种方言，且全程本地                                  |
| 核心功能 / Demo      | 一条命令生成 7 天热力日历，红色显示 03:00 的 7 个重叠任务和 DST 风险                                                |
| MVP / 不做           | P0：Unix cron、GitHub Actions、K8s YAML、时区、未来运行点、重叠提示、HTML；不执行任务、不做分布式调度、不做监控平台 |
| 技术栈 / 难度 / 维护 | Node.js、YAML/cron/timezone 库；中等；Cron 方言与平台演进带来中等成本                                               |
| 传播 / Star / 风险   | 日历截图很适合传播；SRE 社区明确理解价值；但 CronTool 已提供多任务日历，差异化必须依赖“仓库自动发现与来源追踪”      |

真实信号：[GitHub 时区请求讨论](https://github.com/orgs/community/discussions/13454) 长期描述 UTC 排程困惑；[CronTool 多任务视图](https://tool.crontap.com/multiple-cronjobs) 证明重叠可视化有现成需求，同时也构成直接竞争。

### 3.5 PortPeek

**一句话介绍：** 跨平台解释“谁占了我的开发端口、它从哪启动、关闭它有什么后果”，默认只建议、不自动杀进程。

| 项目项             | 内容                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| 目标用户           | Web/移动开发者、学生、本地多服务项目维护者                                                       |
| 具体问题           | `EADDRINUSE` 高频；Windows/macOS/Linux 查进程命令不同，用户常直接强杀错误进程                    |
| 场景 / 替代        | 开发服务器启动失败；替代是 `lsof/netstat/Get-NetTCPConnection`、kill-port、fkill、系统任务管理器 |
| 不足 / 差异化      | 现有单命令常只“kill”；本项目解释监听地址、父进程、工作目录、容器线索，并生成可复制的安全命令     |
| 核心 / Demo        | `portpeek 3000` 展示进程树并指出它来自另一个项目的 `npm run dev`，用户确认后再终止               |
| MVP / 不做         | 端口查询、进程树、项目线索、JSON、交互确认；不做长期监控、防火墙、远程机器管理                   |
| 技术 / 难度 / 成本 | Node 原生模块 + 各平台只读系统命令；中等；平台差异使维护成本偏高                                 |
| 传播 / Star / 风险 | 痛点普遍且 GIF 好懂；但竞争很多，系统权限与进程归因若不可靠会削弱信任                            |

### 3.6 ComposeMap

**一句话介绍：** 把 Docker Compose 的服务、端口、网络、卷、健康检查和依赖关系变成一张可审查的自包含架构图。

| 项目项             | 内容                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| 目标用户           | 接手陌生本地栈的开发者、开源维护者、教学者                                                      |
| 具体问题           | Compose 文件可以运行，却不容易回答入口端口、持久化位置、启动依赖和健康检查缺口                  |
| 场景 / 替代        | 新人理解服务栈、PR 评审 Compose 改动；替代是手画 Mermaid、Docker Desktop、compose-viz           |
| 不足 / 差异化      | 已有可视化多偏拓扑；本项目把“可达性、宿主端口冲突、无健康检查、匿名卷”等可执行提示放进图中      |
| 核心 / Demo        | `npx compose-map` 将 YAML 变成带风险标记的架构海报，并可比较两个 revision                       |
| MVP / 不做         | 单/多 Compose 合并、拓扑、端口/卷/健康检查规则、SVG/HTML；不启动 Docker、不做 Kubernetes 全平台 |
| 技术 / 难度 / 成本 | Node + YAML + Mermaid/SVG；中等；Compose spec 演进造成中等维护成本                              |
| 传播 / Star / 风险 | 架构图适合 README；但“又一个 YAML visualizer”风险高，诊断质量必须成为核心                       |

### 3.7 FixtureMint

**一句话介绍：** 从 JSON Schema/OpenAPI 生成一组小而尖锐的边界样本，而不是一大堆看起来真实的随机假数据。

| 项目项             | 内容                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 目标用户           | API SDK、验证器、表单和数据管道开发者                                                                            |
| 具体问题           | Faker 生成正常样本容易，`null`、边界长度、union 分支、深层可选字段组合仍靠手写                                   |
| 场景 / 替代        | 为契约测试、解析器、前端表单生成 golden fixtures；替代是 JSON Schema Faker、property-based testing、手写 fixture |
| 不足 / 差异化      | 现有工具偏随机或大量生成；本项目输出最小覆盖集，并解释每个 fixture 覆盖的边界                                    |
| 核心 / Demo        | 一个 Schema 生成 9 个命名 fixture，分别覆盖最小值、最大值、缺失、空值和每个 union 分支                           |
| MVP / 不做         | JSON Schema 2020-12 常用子集、确定性 seed、覆盖报告；不做模糊测试引擎、不承诺完整规范、不生成业务语义数据        |
| 技术 / 难度 / 成本 | TypeScript + JSON Schema 解析；中高；规范组合爆炸与 `$ref` 是主要成本                                            |
| 传播 / Star / 风险 | 测试前后对比清楚；可扩展贡献规则；但 JSON Schema Faker 已成熟，必须证明“最小边界覆盖”而非换皮                    |

### 3.8 SameBox

**一句话介绍：** 在“能工作”和“不能工作”的两台机器各生成一份无密钥环境收据，再解释真正不同在哪里。

| 项目项             | 内容                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| 目标用户           | OSS Issue 提交者与维护者、团队开发环境支持人员、课程助教                                                    |
| 具体问题           | “works on my machine”往返追问 OS、运行时、包管理器、Git 配置和关键路径，截图还容易泄密                      |
| 场景 / 替代        | 比较同事两台机器或 CI 与本机；替代是 envinfo、Issue 模板、手工版本清单、Dev Container/Nix                   |
| 不足 / 差异化      | envinfo 擅长单机报告；本项目把两份收据做语义 diff，默认只采集 allowlist 元数据并解释可能影响                |
| 核心 / Demo        | 两份 receipt 对比后只突出 Node 架构、包管理器模式和大小写敏感三个有意义差异                                 |
| MVP / 不做         | OS/CPU/运行时/包管理器/Git/文件系统探针、可审计采集清单、diff、Markdown；不收集全部环境变量、不远程控制机器 |
| 技术 / 难度 / 成本 | Node；中等；探针矩阵很大，长期维护成本偏高                                                                  |
| 传播 / Star / 风险 | 问题普遍、Issue 里可直接贴结果；但需要两次运行，首次 Demo 不如单文件工具立刻                                |

市场证据：`envinfo` 在 npm 页面被描述为 debugging/issue reporting 工具，且截至调研时仍有很高的周下载量；`git bugreport` 也会收集机器、Git 客户端和仓库状态。这证明需求存在，也意味着新项目必须聚焦“双端差异解释”。参见 [envinfo](https://www.npmjs.com/package/envinfo) 与 [git-bugreport 手册](https://manpages.ubuntu.com/manpages/stonking/man1/git-bugreport.1.html)。

### 3.9 DeskSweep

**一句话介绍：** 本地、可预览、可撤销地整理 Downloads/桌面目录，并把每次移动记录成 manifest。

| 项目项             | 内容                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| 目标用户           | 经常下载论文、图片、压缩包的学生、研究者、设计师和开发者                               |
| 具体问题           | 文件命名混乱、重复堆积；自动整理工具容易误移动，用户不敢信任                           |
| 场景 / 替代        | 每周清理 Downloads；替代是 Finder/Explorer 手工排序、Hazel、organize-cli、自写脚本     |
| 不足 / 差异化      | 强调 dry-run HTML、冲突解释、逐项排除、100% undo；不使用云和内容上传                   |
| 核心 / Demo        | 扫描 200 个示例文件，先展示将如何归类，再执行并用一次命令全部撤销                      |
| MVP / 不做         | 扩展名/日期/名称规则、预览、冲突、执行、撤销日志；不做 AI 内容理解、后台常驻、删除文件 |
| 技术 / 难度 / 成本 | Node + 本地 Web UI；中等；文件系统边界和跨平台恢复要求高                               |
| 传播 / Star / 风险 | before/after 极直观，受众较大；但同类成熟、真实目录操作风险高，测试成本大              |

### 3.10 LogFold

**一句话介绍：** 把一段嘈杂日志按稳定模板折叠成“首次出现、重复次数、时间范围和代表样本”的本地故障摘要。

| 项目项             | 内容                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| 目标用户           | 本地开发者、支持工程师、小型服务维护者、学生                                                     |
| 具体问题           | 同一错误带不同 ID/时间戳重复上千次，关键转折被淹没；临时排障不值得搭 ELK/Grafana                 |
| 场景 / 替代        | CI 日志、开发服务器输出、用户上传日志；替代是 grep/awk、lnav、Angle Grinder、Logdy、完整日志平台 |
| 不足 / 差异化      | 零查询语言，自动把数字、UUID、路径片段归一为模板，同时保留可追溯代表行                           |
| 核心 / Demo        | 10,000 行日志缩成 14 个事件卡片，并突出第一次 error 前后的时间线                                 |
| MVP / 不做         | 文本/JSONL、模板归一、计数/时间范围、HTML；不做日志采集 Agent、远程存储、AI 根因分析             |
| 技术 / 难度 / 成本 | Node 流式处理；中等；多行堆栈和误聚类是核心风险                                                  |
| 传播 / Star / 风险 | 压缩前后可视化强；但自动聚类不准会比 grep 更糟，且相邻工具很多                                   |

## 4. 评分模型

所有维度均为 1～10 分，10 分更好。为避免“维护成本 10 分反而更差”的歧义，本表将该列写作**维护友好度**：10 表示长期成本低。当前阶段各项等权，总分是 10 项之和；并列时优先差异化、演示和可行性。

| 排名 | 候选        | 真实 | 痛强 | 规模 | 差异 | 演示 | 可行 | 门槛 | 传播 | 扩展 | 维护友好 |   总分 |
| ---: | ----------- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | -------: | -----: |
|    1 | SchemaStory |    9 |    8 |    8 |    9 |   10 |    8 |   10 |    9 |    9 |        8 | **88** |
|    2 | FirstRun    |    9 |    8 |    9 |    8 |    9 |    8 |    8 |    8 |    8 |        8 | **83** |
|    3 | LockLens    |    9 |    9 |    9 |    8 |    9 |    7 |    8 |    8 |    9 |        6 | **82** |
|    4 | Cronboard   |    8 |    8 |    7 |    7 |   10 |    8 |    9 |    8 |    8 |        7 | **80** |
|    5 | PortPeek    |    9 |    8 |    9 |    6 |    9 |    8 |    9 |    8 |    7 |        6 | **79** |
|    6 | ComposeMap  |    8 |    7 |    8 |    6 |   10 |    8 |    9 |    8 |    7 |        7 | **78** |
|    7 | FixtureMint |    8 |    8 |    8 |    8 |    8 |    7 |    8 |    7 |    9 |        6 | **77** |
|    8 | SameBox     |    9 |    8 |    9 |    8 |    8 |    7 |    7 |    7 |    8 |        6 | **77** |
|    9 | DeskSweep   |    8 |    7 |    9 |    6 |   10 |    7 |    8 |    8 |    7 |        5 | **75** |
|   10 | LogFold     |    9 |    8 |    8 |    5 |    8 |    7 |    9 |    7 |    8 |        5 | **74** |

### 评分依据说明

- **真实程度与痛强：** 公开 Issue/讨论中的具体失败高于只有产品落地页；用户已经用命令或脚本绕过的问题高于“也许有用”。
- **用户规模：** 跨语言开发流程高于单一框架；但目标用户仍需足够具体。
- **差异化：** 不以功能数量计分，主要看能否在一句话里解释为何不用现有工具。
- **演示效果：** 有明显 before/after、能产出单图/GIF 的方向得分更高。
- **可行性：** 以单人 2～4 周完成可信 MVP 为界；多生态解析、系统权限、规范完备性会扣分。
- **首次门槛：** `npx + 两个示例文件` 高于要求 Docker、云账号、数据库或配置平台。
- **自传播：** 结果能贴入 PR/Issue/README，并能让旁观者理解，得分更高。
- **扩展空间：** 输入适配器、规则、输出器和社区 fixture 可独立贡献时得分高。
- **维护友好度：** 输入规范稳定、依赖少、平台差异小，得分高。

总分不是市场真相，只是强制暴露判断依据。ComposeMap、Cronboard 的总分不低，但直接视觉竞品较强，因此没有进入最终 Top 3；SameBox 与 LogFold 同分靠后，是因为它们的采集/聚类正确性更难在第一版建立信任。

## 5. Top 3 竞品与需求验证

### 5.1 SchemaStory 竞品对比

| 竞品                                                                                                | 核心定位 / 功能                                  | 优点                              | 缺点 / 使用门槛                                                     | 活跃程度（快照）                     | 可学习                     | 应避开                     | 差异化机会                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------- | ------------------------------------ | -------------------------- | -------------------------- | -------------------------------------------- |
| [dyff](https://github.com/homeport/dyff)                                                            | YAML/JSON 的结构感知文件 diff                    | 单二进制、路径清楚、适合配置 diff | 比较具体值，不从多条样本推断出现率/类型分布                         | 2026 年仍有 Go package 文档更新      | 紧凑路径表达和 stdin 体验  | 不做另一个漂亮 JSON diff   | 比较“样本集合的观察契约”，而非两份文档值     |
| [json-schema-diff](https://www.npmjs.com/package/json-schema-diff)                                  | 比较两个正式 JSON Schema 并分类兼容性            | 语义明确、适合 CI                 | 前提是用户已有并维护 Schema；不是原始 JSONL                         | 2026 年仍有包版本记录                | breaking/non-breaking 术语 | 不假装样本推断等于正式规范 | 无 Schema 时先发现漂移，并明确置信边界       |
| [oasdiff](https://github.com/oasdiff/oasdiff)                                                       | OpenAPI diff、breaking、changelog、HTML/Markdown | 成熟、输出丰富、本地与 CI 都可用  | 只解决正式 OpenAPI 契约                                             | 近期文档和版本活跃                   | 多输出格式与规则清单       | 不扩张为 API 平台          | 服务未建模 JSON、导出文件和 Agent trace      |
| [YData Profiling / fg-data-profiling](https://github.com/Data-Centric-AI-Community/ydata-profiling) | DataFrame 探索分析、数据集比较、HTML 报告        | 图表全面，已支持比较数据集        | Python/数据帧心智较重；报告范围远大于结构变更；嵌套 JSON 不是主路径 | 2026 年发生包名/社区迁移，仍在演进   | 自包含报告与可复现信息     | 不做通用 EDA 和海量统计图  | 10 秒内回答“哪个嵌套字段会让消费者坏掉”      |
| [Evidently](https://github.com/evidentlyai/evidently)                                               | ML/LLM 评估、数据质量与分布漂移                  | 100+ 指标、报告、测试和监控完整   | 面向 ML/监控，安装和概念明显更重                                    | GitHub 页面显示 2026-03 仍有 release | 报告 + CI 阈值的闭环       | 不做监控服务和统计漂移平台 | 零配置、无 Pandas、一次性 JSON contract diff |
| [whylogs](https://github.com/whylabs/whylogs)                                                       | 隐私友好的数据 profile、约束和长期漂移           | profile 可合并，适合大规模数据    | 主要是库/API 与 ML 数据工作流，不是即开即用的嵌套 JSON diff CLI     | 仓库仍公开，近期维护节奏需进一步核实 | 聚合而非泄露样本值         | 不承诺大数据和长期监控     | 默认只呈现结构聚合，报告可直接发 Issue       |
| [Great Expectations](https://github.com/great-expectations/great_expectations)                      | 完整数据质量 Expectation 框架                    | 生态成熟、规则表达强              | 需要定义/管理 Expectations，远重于一次检查                          | 官方 2026 文档版本仍活跃             | 清楚的验证结果语言         | 不复制平台和配置体系       | 没有事先规则也能得到第一份可行动报告         |

**判断：通过。** 高度相似的热门工具存在于“文件 diff”“正式 Schema diff”“数据质量/ML 漂移”三个相邻市场，但公开检索未发现一个占主导地位的工具同时满足：原始嵌套 JSON/JSONL、无需 Schema、仅结构聚合、单命令、独立 HTML、CI 退出码。YData 与 whylogs 是最需要认真对待的替代方案。

### 5.2 FirstRun 竞品对比

| 竞品                                                | 核心定位 / 功能                                                 | 优点                              | 缺点 / 使用门槛                                       | 活跃程度（快照）                 | 可学习                    | 应避开                     | 差异化机会                               |
| --------------------------------------------------- | --------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------- | -------------------------------- | ------------------------- | -------------------------- | ---------------------------------------- |
| [Runme](https://runme.dev/)                         | 将 Markdown 变为可执行 DevOps notebook，支持 CLI/VS Code/Action | 体验成熟、生态完整、Markdown 兼容 | 更偏执行与交互，不专注模拟陌生用户从干净克隆首次成功  | 2026 年文档仍活跃                | cell 注释、状态化 journey | 不复制 Notebook UI         | 量化 quickstart 步骤、耗时、失败点与残留 |
| [Doc Detective](https://docs.doc-detective.com/)    | 测试文档步骤，支持 shell、HTTP、浏览器和自动检测                | 能力广、CI 与文档测试完整         | 规格和能力面较大，简单 README smoke path 不是唯一中心 | 2026 年文档与 Agent 工具持续更新 | 结构化结果和 CI 集成      | 不在 v1 进入浏览器/AI 自愈 | 极简 opt-in 协议和 clean-copy 默认语义   |
| [mdsh](https://github.com/bashup/mdsh)              | 把 Markdown 编译/解释为 shell，支持多语言 literate programming  | 灵活、依赖少、表达力强            | Bash 中心；信任 Markdown 为程序；不强调 newcomer 证据 | 仓库可用，近期活跃需复核         | Markdown 内联元数据       | 不允许默认执行任意代码块   | 只执行显式 journey，先 dry-run 并列权限  |
| [mktestdocs](https://github.com/koaning/mktestdocs) | 用 pytest 执行 Markdown/docstring 中的 Python 示例              | Python 项目接入自然               | 语言特定，不验证安装/CLI 旅程                         | 仓库与文档仍可访问               | 精确定位到文档块          | 不做多语言代码正确性框架   | 关注安装与命令，而非库代码 doctest       |

**判断：有条件通过。** 需求非常真实，但相邻成熟方案很强。只有把产品严格限定为“README Quick Start 的 clean-room 用户旅程证明”，而不是“可执行 Markdown”，才有充分理由继续。

### 5.3 LockLens 竞品对比

| 竞品                                                                                                                  | 核心定位 / 功能                              | 优点                           | 缺点 / 使用门槛                                                       | 活跃程度（快照）          | 可学习                 | 应避开                         | 差异化机会                              |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ | --------------------------------------------------------------------- | ------------------------- | ---------------------- | ------------------------------ | --------------------------------------- |
| [GitHub Dependency Review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review) | PR 中展示直接/传递依赖变化、漏洞、许可证等   | 原生 PR 体验强，信息丰富       | 与 GitHub/PR 绑定；私有仓库部分使用条件更高；本地 pre-commit 体验有限 | 官方 2026 文档持续更新    | 对变化分组和 PR 呈现   | 不与 GitHub 全平台功能正面对撞 | 离线、本地、GitLab/无托管场景、因果路径 |
| [dependency-review-action](https://github.com/actions/dependency-review-action)                                       | 在 CI 中阻止漏洞或许可证问题                 | 官方、策略丰富、输出可复用     | 依赖 GitHub API/Action，上手不是本地一次命令                          | 页面显示 v5/Node 24，活跃 | 清楚的策略与 JSON 输出 | 不自建漏洞数据库               | 只解释 lockfile 本身可验证的事实        |
| [lockfile-lint](https://www.npmjs.com/package/lockfile-lint)                                                          | 检查 registry、URL、协议等 lockfile 安全策略 | 专注、成熟、CI 友好            | 主要是 lint；当前公开文档只明确 npm/yarn                              | 2026 年仍有 5.x 发布      | 来源与协议规则         | 不输出模糊“安全分”             | 补上版本变化、传递引入路径和人类报告    |
| [npvd](https://www.reddit.com/r/npm/comments/1tzujf7/npvdnpvd_a_node_packages_version_diff_utility/)                  | 列出两个 Git revision 间的 Node 包版本变化   | 问题边界小，覆盖 npm/pnpm/yarn | 更偏版本清单；公开成熟度仍需核实                                      | 2026 年有公开发布讨论     | 多 lockfile fixture    | 不只列 added/removed/changed   | 解释“为什么进来”和“为什么值得看”        |

**判断：通过但风险高。** 问题已被 GitHub 官方产品验证，价值明确；机会在本地和多托管平台，但格式兼容维护成本最高。适合作为第二个项目，不适合当前第一次冲击 100 Stars。

## 6. 最值得实现的三个方向

### 1. SchemaStory

**支持：**

- 有具体、近期的静默数据破坏案例，而不是抽象需求。
- 一条命令、两个文件、一个 HTML，价值闭环短。
- 不需要云、模型、数据库或正式 Schema，首次门槛很低。
- 嵌套结构树和严重度卡片非常适合 GIF、README 和 PR 截图。
- 输入适配器、规则、报告主题、CI Action 都能成为后续贡献面。

**反对：**

- 样本只是观察，不是契约；必须一直展示样本量和“不确定”状态。
- YData、whylogs、Evidently 已有数据集比较能力，定位稍微变宽就会失去差异化。
- 数组中的多形态对象和类型合并规则容易产生误报。

### 2. FirstRun

**支持：**

- README 失效是几乎所有开源维护者都能理解的痛点。
- 可以成为每个 release 的 CI check，留存机制自然。
- “第几步失败、浪费新用户多少时间”的 Demo 很有情绪张力。

**反对：**

- Runme 与 Doc Detective 已非常接近且持续维护。
- 执行 shell 代码的安全模型和跨平台语义会消耗大量设计精力。
- 真正的“干净环境”通常需要容器/VM，而本地复制目录只能提供有限隔离。

### 3. LockLens

**支持：**

- GitHub 官方功能和安全社区已经验证 lockfile review 是真实工作流。
- 原始 diff 与因果图的视觉反差强。
- 供应链安全和自动依赖更新让问题不会很快消失。

**反对：**

- GitHub Dependency Review 是强势免费替代，尤其对公开仓库。
- 多包管理器、多 lockfile 版本、workspace/peer/hoist 会快速扩大维护面。
- 如果无法准确重建依赖因果关系，产品只剩“更漂亮的 diff”。

## 7. 最终推荐

> 为【维护非正式 JSON/JSONL 数据接口的 API、数据与 AI 开发者】提供一个【本地结构漂移审查 CLI】，帮助他们在【上游数据、导出格式或模型输出发生版本变化】时解决【字段删除、类型改变、空值激增和嵌套形状变化被值噪声掩盖】的问题。与【文本 diff、要求预先存在 Schema 的 diff 工具、重型数据质量平台】相比，本项目通过【从真实样本推断观察契约、默认不输出原始值，并生成按风险分级的独立 HTML】让用户能够【在合并或上线前 30 秒看出会破坏消费者的结构变化】。

推荐项目名暂定 **SchemaStory**，发布前必须再次检查 GitHub、npm 和商标可用性。README 的核心句建议为：

> See how your real JSON shape changed — even when you never had a schema.

### 为什么值得解决

非正式 JSON/JSONL 广泛存在于导出、日志、Agent trace、抓取和内部 API。它们常被当作“自描述”，实际却没有兼容性保护；公开 Issue 已显示升级可导致下游静默误解析，而静默错误通常比立即失败更昂贵。

### 为什么用户可能愿意传播

报告天然属于 PR、Issue 和事故复盘的沟通材料。旁观者无需了解实现，只看一张结构树就能理解“字段消失/类型改变/空值上升”。工具同时解决分析和沟通，因此产物本身就是传播载体。

### 为什么现有项目没有完全解决

- 文本 diff 比较的是值和行，不是样本集合中的字段契约。
- JSON Schema/OpenAPI diff 在已有正式契约时非常优秀，但很多脏数据路径正因为没有契约才危险。
- YData、Evidently、whylogs、Great Expectations 功能更广，主要心智是 EDA、ML/统计漂移、约束或监控；安装与配置也超出一次 JSON 结构审查。

### MVP 最吸引人的 Demo

用两个 20 行 JSONL 文件模拟一次 Agent trace 升级：`message.content` 从字符串变为数组、`usage` 只在 62% 记录出现、`sessionId` 被删除、`timestamp` 新增空值。先展示普通 diff 的大量值噪声，再运行：

```text
npx schemastory examples/v1.jsonl examples/v2.jsonl --open
```

输出一张无原始数据的 HTML：顶部显示 `2 breaking · 2 risky · 1 added`，下方按路径展示变化、样本量、置信说明与建议。15～20 秒 GIF 足以完整讲清价值。

### 最大技术与产品风险

1. **把观察误写成事实：** 样本没出现某字段，不等于正式契约删除。UI 必须展示样本量、出现率和推断口吻，不能伪装成完整 Schema 验证器。
2. **异构数组合并：** 多种对象形状、深层数组、递归或超大记录会制造性能和可读性问题，需要深度/节点/样本上限。
3. **误报严重度：** “string -> string|null”对某些消费者是 breaking，对另一些只是 warning。MVP 应提供透明默认规则和简单阈值配置，不输出神秘总分。
4. **竞品边界漂移：** 一旦加入统计分布、数据库、监控或全套数据质量，项目会直接进入 Evidently/whylogs/GX 的强势范围。
5. **隐私承诺：** 报告默认不得嵌入原始值；错误栈、fixture 与调试日志也必须遵守这一点。

## 8. 明确淘汰的热门直觉方向

| 方向                            | 淘汰原因                                                                                       | 证据                                                                                                                                                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.example` 漂移检查         | 2026 年同质实现密集，差异化窗口很窄                                                            | [dotenvdrift](https://pypi.org/project/dotenvdrift/)、[envgap](https://pypi.org/project/envgap/0.2.0/)、[EnvGuard](https://marketplace.visualstudio.com/items?itemName=faizkhairi.envguard-vscode)                                                 |
| 分享前日志/终端脱敏             | 真需求，但 ShareClean、LogShield、ScrubDuck 等已直接覆盖“本地、确定性、分享前”定位             | [LogShield](https://logshield.dev/)、[detect-secrets](https://github.com/Yelp/detect-secrets)、[scrubadub](https://github.com/LeapBeyond/scrubadub)                                                                                                |
| 失败命令自动生成 Bug 报告       | envinfo、git-bugreport、asciinema 分别覆盖组件，且 2026 年已出现直接命名为 FailPack 的新产品   | [envinfo](https://www.npmjs.com/package/envinfo)、[asciinema](https://docs.asciinema.org/getting-started/)、[FailPack 公开介绍](https://www.linkedin.com/posts/failpack_failpack-ai-ready-bug-reports-from-your-activity-7474102662637015040-5nhO) |
| GitHub Actions 可视化与安全解释 | GitHub 自带运行图，OpenLume 已做浏览器解释，actionlint/zizmor/wrkflw 覆盖 lint、安全和本地运行 | [GitHub workflow visualization](https://github.blog/changelog/2020-12-08-github-actions-workflow-visualization/)、[zizmor](https://zizmor.sh/)、[OpenLume](https://openlume.com/explain/github-actions)                                            |

## 9. 决策门与下一步

依据 `AGENTS.md` 的当前任务，本轮到此暂停编码。若确认 SchemaStory，下一阶段应依次完成：

1. 再做 5～8 个目标用户的快速问题访谈或公开 issue outreach，只问现有流程与最近一次事故；
2. 检查 `SchemaStory` 的 GitHub/npm/商标命名可用性并准备 2 个备选名；
3. 编写 `COMPETITOR_ANALYSIS.md`、`PRD.md` 和 `ARCHITECTURE.md`；
4. 冻结 P0：JSON/JSONL、结构聚合、风险规则、终端/JSON/HTML、CI 退出码；
5. 先用两个 fixture 做纯函数推断与 diff 的最短闭环，再做 CLI 和视觉报告。

只有在方向确认后才创建源码、依赖、测试和发布文件。
