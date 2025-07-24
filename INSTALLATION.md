# Installation Guide - Running go-parallel Globally

This guide shows you how to install and run the `go-parallel` CLI tool globally on your local machine.

## Prerequisites

- Node.js 16+ installed
- Git installed
- npm or yarn package manager

## Method 1: Using npm link (Recommended for Development)

This method creates a symbolic link, so any changes you make to the source code will be immediately available.

```bash
# Navigate to the go-parallel directory
cd /path/to/go-parallel

# Build the project
npm run build

# Create a global link
npm link

# Test the installation
go-parallel --help
```

**To unlink later:**

```bash
npm unlink
```

## Method 2: Install globally with npm

This method installs the package globally on your system.

```bash
# Navigate to the go-parallel directory
cd /path/to/go-parallel

# Build the project
npm run build

# Install globally
npm install -g .

# Test the installation
go-parallel --help
```

**To uninstall:**

```bash
npm uninstall -g go-parallel
```

## Method 3: Using yarn (if you prefer yarn)

```bash
# Navigate to the go-parallel directory
cd /path/to/go-parallel

# Build the project
npm run build

# Install globally with yarn
yarn global add .

# Test the installation
go-parallel --help
```

## Method 4: Manual Installation

If you want to install it manually:

```bash
# Navigate to the go-parallel directory
cd /path/to/go-parallel

# Build the project
npm run build

# Make the CLI executable
chmod +x dist/index.js

# Create a symbolic link manually
sudo ln -s $(pwd)/dist/index.js /usr/local/bin/go-parallel

# Test the installation
go-parallel --help
```

## Method 5: Using npx (No Installation Required)

You can run the tool without installing it globally:

```bash
# Navigate to the go-parallel directory
cd /path/to/go-parallel

# Build the project
npm run build

# Run using npx
npx . --help
```

## Verification

After installation, verify that the tool is working:

```bash
# Check if the command is available
which go-parallel

# Test the help command
go-parallel --help

# Test creating a worktree (in a Git repository)
go-parallel create test-feature
```

## Troubleshooting

### Command not found

If you get "command not found", check:

1. Node.js is installed: `node --version`
2. npm is installed: `npm --version`
3. The global bin directory is in your PATH: `echo $PATH`

### Permission errors

If you get permission errors:

```bash
# Use sudo for global installation
sudo npm install -g .

# Or configure npm to use a different directory
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Git not found

Make sure Git is installed and available in your PATH:

```bash
which git
git --version
```

## Usage Examples

Once installed globally, you can use the tool from any directory:

```bash
# Create a worktree
go-parallel create my-feature

# List worktrees
go-parallel list

# Merge worktrees
go-parallel merge worktrees/project-feature1 worktrees/project-feature2

# Remove a worktree
go-parallel remove my-feature

# Clean up worktrees
go-parallel clean
```

## Development

For development, use `npm link` as it allows you to make changes to the source code and see them immediately without reinstalling:

```bash
# In the go-parallel directory
npm run build
npm link

# Make changes to src/
npm run build
# Changes are immediately available in the global command
```
