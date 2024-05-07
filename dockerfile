FROM opensuse/tumbleweed
LABEL org.opencontainers.image.source=https://github.com/Aquaticat/monochromatic-devcontainer
LABEL org.opencontainers.image.description="Monochromatic Devcontainer base"
LABEL org.opencontainers.image.licenses=Apache-2.0
WORKDIR /root
COPY . .
RUN ln -sf bash /bin/sh
RUN chsh -s /bin/bash
RUN zypper in -y which awk curl unzip
RUN source ~/.bashrc && curl -fsSL https://fnm.vercel.app/install | bash
RUN source ~/.bashrc && fnm install --lts
RUN source ~/.bashrc && fnm default 20
RUN source ~/.bashrc && yarn set version stable
RUN source ~/.bashrc && yarn
RUN source ~/.bashrc && zx ./src/index.js
ENTRYPOINT ["/bin/bash"]
