#!/usr/bin/env zx
import {
  appendFile,
  mkdir,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  $,
  cd,
  within,
} from 'zx';

console.log('on create: src/index.js taking over');

$.prefix += 'shopt -s expand_aliases && source ~/.bashrc && ';

await Promise.all([
  (async function pnpmG() {
    await $`pnpm i -g ${[
      '@mdx-js/language-server',
      'remark-language-server',
      'typescript-language-server',
      'yaml-language-server',
      'vscode-langservers-extracted',
      'neovim',
    ]}`
      .pipe(process.stdout);
  })(),
  (async function zypperOther() {
    await appendFile('/etc/zypp/zypp.conf',
    `
repo.refresh.delay=100
download.max_concurrent_connections=16
`);

    await $`zypper in -y ${[
      'autoconf',
      'automake',
      'binutils',
      'bison',
      'brotli',
      'cmake',
      'cpp',
      'helix',
      'gcc',
      'gcc-c++',
      'gettext-tools',
      'git',
      'glibc-devel',
      'go',
      'graphviz',
      'helix',
      'ImageMagick',
      'libstdc++-devel',
      'libtool',
      'm4',
      'make',
      'mozilla-nss-tools',
      'ncurses-devel',
      'patch',
      'plantuml',
      'rsvg-convert',
      'rustup',
      'zlib-devel',
    ]}`
      .pipe(process.stdout);

    await appendFile(join(homedir(), '.bashrc'), `
export GOPATH="$HOME/go"
export GOBIN="$GOPATH/bin"
export PATH="$HOME/bin:$HOME:$HOME/.cargo/bin:$GOBIN:$PATH"
export TERMINAL="zellij run -c -- "
export EDITOR="helix"
alias ls="lsd"
alias hx="helix"
alias pe="pnpm exec"
alias pi="pnpm install"
alias pr="pnpm run"
alias pb="pnpm build"
`);

    await Promise.all([
      (async function rust() {
        await $`rustup default stable`.pipe(process.stdout);
        await $`curl -L --proto '=https' --tlsv1.3 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash`;
        await $`cargo binstall --no-confirm ${['ripgrep', 'starship', 'lsd', 'zellij']}`.pipe(
          process.stdout,
        );

        await Promise.all([
          (async function rg() {
            await $`rg --version`;
          })(),
          (async function starship() {
            await mkdir(join(homedir(), '.config'), { recursive: true });
            await appendFile(
              join(homedir(), '.config', 'starship.toml'),
              `
[cmd_duration]
min_time=3_000
format='t [$duration]($style)'

[container]
format='[$symbol]($style) '
style='dimmed'

[time]
disabled=false
format='[$time]($style) '
time_format='%R'

# We're only using git on the host.
[git_branch]
only_attached=true
disabled=true

[git_status]
disabled=true

# Don't need the full node version normally.
# When in doubt, run node --version manually.
[nodejs]
format='v [$symbol($version )]($style)'
version_format='\${major}'

[package]
symbol=''
format='[$symbol$version]($style) '
`,
            );

            await appendFile(
              join(homedir(), '.bashrc'),
          `
eval "$(starship init bash)"
`,
        );

            await $`starship --version`;
          })(),
          (async function zellij() {
            await mkdir(join(homedir(), '.config', 'zellij'), { recursive: true });
            await appendFile(
              join(homedir(), '.config', 'zellij', 'config.kdl'),
              `
on_force_close "quit"
`,
            );
            await $`zellij --version`;
          })(),
          (async function hx() {
            await $`helix --version`;
          })(),
          (async function ls() {
            await mkdir(join(homedir(), '.config', 'lsd'), { recursive: true });
            await appendFile(
              join(homedir(), '.config', 'lsd', 'config.yaml'),
              `
blocks:
  - permission
  - user
  - group
  - context
  - size
  - date
  - name
  - inode
  - links
  - git
icons:
  theme: unicode
indicators: true
layout: tree
recursion:
  enabled: true
  depth: 8
total-size: true
hyperlink: auto
`,
            );

            await $`lsd --version`;
          })(),
        ]);
      })(),
      (async function caddy() {
        await $`go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest`;

        await $`xcaddy build ${[
          '--with', 'github.com/mholt/caddy-events-exec',
          '--with', 'github.com/mholt/caddy-webdav',
          '--with', 'github.com/mholt/caddy-l4',
          '--with', 'github.com/porech/caddy-maxmind-geolocation',
          '--with', 'github.com/mholt/caddy-ratelimit',
          '--with', 'github.com/caddyserver/cache-handler',
          '--with', 'github.com/caddyserver/jsonc-adapter',
          '--with', 'github.com/caddy-dns/porkbun',
          '--with', 'github.com/caddy-dns/njalla',
        ]}`
          .pipe(process.stdout);

        await $`chmod +x ./caddy`;

        await $`caddy --version`;

        await $`caddy start`;
        await $`caddy trust`;
        await $`caddy stop`;
      })(),
    ]);
  })(),
]);

await $`lsd`.pipe(process.stdout);
