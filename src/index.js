#!/usr/bin/env zx
import {
  appendFile,
  mkdir,
} from 'node:fs/promises';
import { homedir, arch } from 'node:os';
import { join } from 'node:path';
import { $ } from 'zx';

console.log('on create: src/index.js taking over');

$.prefix += 'shopt -s expand_aliases && source ~/.bashrc && ';

await Promise.all([
  (async function pmG() {
/*     await $`npm i -g --force ${[
      '@mdx-js/language-server',
      'remark-language-server',
      'typescript-language-server',
      'yaml-language-server',
      'vscode-langservers-extracted',
      'neovim',
    ]}`
      .pipe(process.stdout); */
  })(),
  (async function zypperOther() {
    await appendFile('/etc/zypp/zypp.conf',
    `
repo.refresh.delay=100
download.max_concurrent_connections=16
`);

    await $`zypper in -y ${[
      //region Utils
      'helix',
      'git',
      'openssh-clients',
      //endregion

      //region Depends
      'graphviz',
      'ImageMagick',
      'lsof',
      'mozilla-nss-tools',
      'patch',
      'plantuml',
      'rsvg-convert',
      'zstd',
      //endregion

      //region Package Managers
      'go',
      'rustup',
      //endregion
    ]}`
      .pipe(process.stdout);

    await Promise.all([
      (async function mkcert() {
        await $`curl  -JLO "https://dl.filippo.io/mkcert/latest?for=linux/${
          new Map([['arm', 'arm'], ['arm64', 'arm64'], ['x64', 'amd64']]).get(arch())
        }"`.pipe(process.stdout);
        await $`chmod +x mkcert-v*-linux-*`;
        await $`mv mkcert-v*-linux-* /usr/local/bin/mkcert`;
        await $`mkcert -install`.pipe(process.stdout);
      })(),
      (async function git() {
        // https://stackoverflow.com/questions/72219458/is-it-possible-to-override-yarn-install-to-use-https-instead-of-git
        await $`git config --global url."https://github".insteadOf ssh://git@github`;
        await $`git config --global url."https://github.com/".insteadOf git@github.com:`;
      })(),
      (async function rust() {
        await $`rustup default stable`.pipe(process.stdout);
        await $`curl -L --proto '=https' --tlsv1.3 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash`;
        await $`cargo binstall --no-confirm ${['ripgrep', 'starship', 'lsd', 'zellij', 'static-web-server']}`.pipe(
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
format='v [$symbol ($version)]($style) '
version_format='\${major}'
symbol='node'

[bun]
format='v [$symbol ($version)]($style) '
version_format='\${major}.\${minor}'
style='bold yellow'
symbol='bun'

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
  depth: 3
total-size: true
hyperlink: auto
`,
            );

            await $`lsd --version`;
          })(),
        ]);
      })(),
    ]);
  })(),
]);

await $`rm -rf ${['package.json', 'src', '.devcontainer.json', '.editorconfig', '.github', '.gitattributes', '.gitignore', '.npmrc', '.biome.jsonc', 'dockerfile', 'dprint.json', 'LICENSE']}`;

await $`lsd`.pipe(process.stdout);
