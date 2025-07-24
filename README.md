# Go Parallel - Git Worktree Manager

A CLI tool built with TypeScript and Commander for managing Git worktrees efficiently. This tool helps you create, list, merge, and manage multiple Git worktrees for parallel development.

## Features

- ✅ Create Git worktrees for new features
- ✅ List all current worktrees with status
- ✅ Merge multiple worktrees by paths
- ✅ Remove worktrees safely
- ✅ Clean up merged worktrees
- ✅ Automatic project name detection
- ✅ Interactive confirmations
- ✅ Beautiful colored output

## Installation

### Quick Start (Global Installation)

1. Clone this repository or download the files
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Install globally:
   ```bash
   npm install -g .
   ```
4. Test the installation:
   ```bash
   go-parallel --help
   ```

### Development Installation

1. Clone this repository or download the files
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Create a global link (for development):
   ```bash
   npm link
   ```
5. Make the CLI executable:
   ```bash
   chmod +x dist/index.js
   ```

For detailed installation instructions, see [INSTALLATION.md](./INSTALLATION.md).

## Usage

### Create a new worktree

```bash
# Create a worktree for a feature
go-parallel create my-feature

# Specify custom path and branch
go-parallel create my-feature -p ./custom-worktrees -b feature/my-custom-branch
```

### List all worktrees

```bash
# List worktrees in default location
go-parallel list

# List worktrees in custom location
go-parallel list -p ./custom-worktrees
```

### Merge worktrees

```bash
# Merge multiple worktrees into main branch
go-parallel merge ./worktrees/project-feature1 ./worktrees/project-feature2

# Merge with custom target branch and message
go-parallel merge ./worktrees/project-feature1 -t develop -m "Merge feature branches"
```

### Remove a worktree

```bash
# Remove a worktree with confirmation
go-parallel remove my-feature

# Force remove without confirmation
go-parallel remove my-feature -f
```

### Clean up worktrees

```bash
# Clean up merged worktrees with confirmation
go-parallel clean

# Force clean without confirmation
go-parallel clean -f
```

## Commands

### `create <feature>`

Creates a new Git worktree for the specified feature.

**Options:**

- `-p, --path <path>`: Path to store worktrees (default: `./worktrees`)
- `-b, --branch <branch>`: Branch name (default: `feature/<feature>`)

**Example:**

```bash
go-parallel create user-authentication
# Creates: ./worktrees/project-user-authentication
```

### `list`

Lists all current worktrees with their status.

**Options:**

- `-p, --path <path>`: Path to worktrees directory (default: `./worktrees`)

**Example:**

```bash
go-parallel list
```

### `merge <paths...>`

Merges multiple worktrees by their paths.

**Options:**

- `-t, --target <target>`: Target branch to merge into (default: `main`)
- `-m, --message <message>`: Merge commit message

**Example:**

```bash
go-parallel merge ./worktrees/project-feature1 ./worktrees/project-feature2 -t develop
```

### `remove <feature>`

Removes a worktree for the specified feature.

**Options:**

- `-p, --path <path>`: Path to worktrees directory (default: `./worktrees`)
- `-f, --force`: Force removal without confirmation

**Example:**

```bash
go-parallel remove user-authentication
```

### `clean`

Cleans up merged worktrees that are in a clean state.

**Options:**

- `-p, --path <path>`: Path to worktrees directory (default: `./worktrees`)
- `-f, --force`: Force cleanup without confirmation

**Example:**

```bash
go-parallel clean
```

## Workflow Example

1. **Start a new feature:**

   ```bash
   go-parallel create user-login
   cd worktrees/project-user-login
   # Make your changes...
   git add .
   git commit -m "Add user login functionality"
   ```

2. **Start another feature:**

   ```bash
   go-parallel create user-registration
   cd worktrees/project-user-registration
   # Make your changes...
   git add .
   git commit -m "Add user registration functionality"
   ```

3. **Check your worktrees:**

   ```bash
   go-parallel list
   ```

4. **Merge completed features:**

   ```bash
   go-parallel merge ./worktrees/project-user-login ./worktrees/project-user-registration
   ```

5. **Clean up merged worktrees:**
   ```bash
   go-parallel clean
   ```

## Project Structure

```
go-parallel/
├── src/
│   ├── index.ts          # CLI entry point
│   └── worktree-manager.ts # Core worktree management logic
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Requirements

- Node.js 18+
- Git

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run the built version
npm start
```

## License

MIT
