## Git

Although git is installed inside the dev container, it's recommended you use the git command installed on your host machine.

## `pnpm-install.sh`

From `https://get.pnpm.io/install.sh`.

Copied down so I don't hit their servers every time I change my configurations.

## Install updated Skopeo on ubuntu-latest

```yaml
# See https://github.com/devcontainers/ci/issues/191#issuecomment-1416384710
- name: Install updated Skopeo
  # This can be omitted once runner images have a version of Skopeo > 1.4.1
  # See https://github.com/containers/skopeo/issues/1874
  run: |
    sudo apt purge buildah golang-github-containers-common podman skopeo
    sudo apt autoremove --purge
    REPO_URL="https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/unstable"
    source /etc/os-release
    sudo sh -c "echo 'deb ${REPO_URL}/x${NAME}_${VERSION_ID}/ /' > /etc/apt/sources.list.d/devel:kubic:libcontainers:unstable.list"
    sudo wget -qnv https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable/x${NAME}_${VERSION_ID}/Release.key -O Release.key
    sudo apt-key add Release.key
    sudo apt-get update
    sudo apt-get install skopeo
```
