FROM opensuse/tumbleweed
LABEL org.opencontainers.image.source=https://github.com/Aquaticat/monochromatic-devcontainer
LABEL org.opencontainers.image.description="Monochromatic Devcontainer base"
LABEL org.opencontainers.image.licenses=Apache-2.0
WORKDIR /root
COPY . .
RUN ln -sf bash /bin/sh
RUN chsh -s /bin/bash
RUN zypper in -y which awk nodejs20 corepack20
RUN source ~/.bashrc && corepack enable
RUN source ~/.bashrc && yarn set version stable
RUN source ~/.bashrc && yarn
RUN source ~/.bashrc && zx ./src/index.js
ENTRYPOINT ["/bin/bash"]
