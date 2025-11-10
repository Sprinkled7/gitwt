# GitWT - Git 工作树管理器

一个用于高效管理 Git 工作树的 CLI 工具，并提供一些方便的功能。

## 功能特性

- ✅ 为新功能创建 Git 工作树,默认在父级创建,不影响当前 git.
- ✅ 列出所有当前工作树及其状态
- ✅ 按路径合并多个工作树
- ✅ 安全删除工作树
- ✅ 清理已合并的工作树
- ✅ 自动项目名称检测
- ✅ 交互式确认
- ✅ 美观的彩色输出
- ✅ **新功能**：自动复制环境文件
- ✅ **新功能**：自动安装依赖

## 安装

使用 npm 全局安装：

```bash
npm install -g @sprinkled7/gitwt
```

安装完成后，可以使用 `gitwt` 命令：

```bash
gitwt --help
```

## 使用方法

### 创建新工作树

```bash
# 为功能创建工作树
gitwt new my-feature

# 指定自定义路径和分支
gitwt new my-feature -p ./custom-worktrees -b feature/my-custom-branch
```

### 列出所有工作树

```bash
# 列出默认位置的工作树
gitwt ls

# 列出自定义位置的工作树
gitwt ls -p ./custom-worktrees
```

### 合并工作树

```bash
# 将多个工作树合并到主分支
gitwt mrg ./worktrees/project-feature1 ./worktrees/project-feature2

# 使用自定义目标分支和消息进行合并
gitwt mrg ./worktrees/project-feature1 -t develop -m "合并功能分支"
```

### 删除工作树

```bash
# 删除工作树（带确认）
gitwt rm my-feature

# 强制删除（无需确认）
gitwt rm my-feature -f
```

### 清理工作树

```bash
# 清理已合并的工作树（带确认）
gitwt clean

# 强制清理（无需确认）
gitwt clean -f
```

## 命令说明

### `new <feature>`

为指定功能创建新的 Git 工作树。

**选项：**

- `-p, --path <path>`: 存储工作树的路径（默认：`../worktrees`）
- `-b, --branch <branch>`: 分支名称（默认：`feature/<feature>`）
- `--no-copy-env`: 跳过复制环境文件
- `--no-install-packages`: 跳过安装包

**示例：**

```bash
gitwt new user-authentication
# 创建：./worktrees/project-user-authentication
# 复制：.env, .env.local, .env.development 等
# 安装：npm/yarn/pnpm 包（如果存在 package.json）
```

### `ls`

列出所有当前工作树及其状态。

**选项：**

- `-p, --path <path>`: 工作树目录路径（默认：`./worktrees`）

**示例：**

```bash
gitwt ls
```

### `mrg <paths...>`

按路径合并多个工作树。

**选项：**

- `-t, --target <target>`: 要合并到的目标分支（默认：`main`）
- `-m, --message <message>`: 合并提交消息

**示例：**

```bash
gitwt mrg ./worktrees/project-feature1 ./worktrees/project-feature2 -t develop
```

### `rm <feature>`

删除指定功能的工作树。

**选项：**

- `-p, --path <path>`: 工作树目录路径（默认：`./worktrees`）
- `-f, --force`: 强制删除，无需确认

**示例：**

```bash
gitwt rm user-authentication
```

### `clean`

清理已合并到主分支且处于干净状态的工作树。

**选项：**

- `-p, --path <path>`: 工作树目录路径（默认：`./worktrees`）
- `-f, --force`: 强制清理，无需确认

**功能说明：**

- 仅删除已合并到主分支的工作树
- 跳过有未提交更改的工作树
- 跳过尚未合并的分支的工作树
- 同时删除工作树和已合并的分支
- 提供清晰的反馈，说明跳过哪些内容及原因

**示例：**

```bash
gitwt clean
```

## 系统要求

- Node.js 18+
- Git

## 开发

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 运行构建后的版本
npm start

# 运行测试
npm test

# 监视模式运行测试
npm run test:run
```

## 许可证

Apache-2.0 license
