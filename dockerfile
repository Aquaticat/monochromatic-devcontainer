FROM opensuse/tumbleweed
LABEL org.opencontainers.image.source=https://github.com/Aquaticat/monochromatic-devcontainer
LABEL org.opencontainers.image.description="Monochromatic Devcontainer base"
LABEL org.opencontainers.image.licenses=Apache-2.0
WORKDIR /root
COPY . .
RUN zypper in -y which awk
RUN chmod +x ./pnpm-install.sh
RUN ./pnpm-install.sh
RUN ln -sf bash /bin/sh
RUN chsh -s /bin/bash
RUN source ~/.bashrc && pnpm env use --global iron
RUN source ~/.bashrc && pnpm i -g zx
RUN source ~/.bashrc && pnpm i --force
RUN source ~/.bashrc && zx ./src/index.js
ENTRYPOINT ["/bin/bash"]
