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
- ✅ **NEW**: Automatic environment file copying
- ✅ **NEW**: Automatic package installation

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
   gitwt --help
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
gitwt new my-feature

# Specify custom path and branch
gitwt new my-feature -p ./custom-worktrees -b feature/my-custom-branch
```

### List all worktrees

```bash
# List worktrees in default location
gitwt ls

# List worktrees in custom location
gitwt ls -p ./custom-worktrees
```

### Merge worktrees

```bash
# Merge multiple worktrees into main branch
gitwt mrg ./worktrees/project-feature1 ./worktrees/project-feature2

# Merge with custom target branch and message
gitwt mrg ./worktrees/project-feature1 -t develop -m "Merge feature branches"
```

### Remove a worktree

```bash
# Remove a worktree with confirmation
gitwt rm my-feature

# Force remove without confirmation
gitwt rm my-feature -f
```

### Clean up worktrees

```bash
# Clean up merged worktrees with confirmation
gitwt clean

# Force clean without confirmation
gitwt clean -f
```

## Commands

### `new <feature>`

Creates a new Git worktree for the specified feature.

**Options:**

- `-p, --path <path>`: Path to store worktrees (default: `./worktrees`)
- `-b, --branch <branch>`: Branch name (default: `feature/<feature>`)
- `--no-copy-env`: Skip copying environment files
- `--no-install-packages`: Skip installing packages

**Example:**

```bash
gitwt new user-authentication
# Creates: ./worktrees/project-user-authentication
# Copies: .env, .env.local, .env.development, etc.
# Installs: npm/yarn/pnpm packages (if package.json exists)
```

### `ls`

Lists all current worktrees with their status.

**Options:**

- `-p, --path <path>`: Path to worktrees directory (default: `./worktrees`)

**Example:**

```bash
gitwt ls
```

### `mrg <paths...>`

Merges multiple worktrees by their paths.

**Options:**

- `-t, --target <target>`: Target branch to merge into (default: `main`)
- `-m, --message <message>`: Merge commit message

**Example:**

```bash
gitwt mrg ./worktrees/project-feature1 ./worktrees/project-feature2 -t develop
```

### `rm <feature>`

Removes a worktree for the specified feature.

**Options:**

- `-p, --path <path>`: Path to worktrees directory (default: `./worktrees`)
- `-f, --force`: Force removal without confirmation

**Example:**

```bash
gitwt rm user-authentication
```

### `clean`

Cleans up worktrees that have been merged into the main branch and are in a clean state.

**Options:**

- `-p, --path <path>`: Path to worktrees directory (default: `./worktrees`)
- `-f, --force`: Force cleanup without confirmation

**What it does:**

- Only removes worktrees whose branches have been merged into the main branch
- Skips worktrees with uncommitted changes
- Skips worktrees whose branches haven't been merged yet
- Deletes both the worktree and the merged branch
- Provides clear feedback about what's being skipped and why

**Example:**

```bash
gitwt clean
```

## Workflow Example

1. **Start a new feature:**

   ```bash
   gitwt new user-login
   # Automatically copies .env files and installs packages
   cd worktrees/project-user-login
   # Make your changes...
   git add .
   git commit -m "Add user login functionality"
   ```

2. **Start another feature:**

   ```bash
   gitwt new user-registration
   # Automatically copies .env files and installs packages
   cd worktrees/project-user-registration
   # Make your changes...
   git add .
   git commit -m "Add user registration functionality"
   ```

3. **Check your worktrees:**

   ```bash
   gitwt ls
   ```

4. **Merge completed features:**

   ```bash
   gitwt mrg ./worktrees/project-user-login ./worktrees/project-user-registration
   ```

5. **Clean up merged worktrees:**
   ```bash
   gitwt clean
   ```

## Project Structure

```
go-parallel/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── worktree-manager.ts   # Core worktree management logic
│   ├── env-copier.ts         # Environment file copying utilities
│   ├── package-installer.ts  # Package installation utilities
│   ├── config.ts             # Configuration constants
│   └── types.ts              # Type definitions
├── tests/                    # Test files
├── dist/                     # Compiled JavaScript
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

# Run tests
npm test

# Run tests in watch mode
npm run test:run
```

## License

MIT
