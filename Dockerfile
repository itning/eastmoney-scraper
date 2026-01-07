FROM ghcr.io/puppeteer/puppeteer:latest

# 切换到 root 用户以安装 pnpm
USER root

# 设置环境变量，使用镜像内置的 Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 安装 pnpm
RUN npm install -g pnpm@10.27.0

# 设置工作目录
WORKDIR /home/pptruser/app

# 复制包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 修改权限
RUN chown -R pptruser:pptruser /home/pptruser/app

# 切换回 pptruser 用户
USER pptruser

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["pnpm", "start"]
