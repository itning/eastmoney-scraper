# Eastmoney Scraper (天天基金网爬虫)

这是一个基于 Node.js、Puppeteer 和 Express 构建的简单 API 服务，用于爬取天天基金网（eastmoney.com）的基金历史净值数据。

## 功能特性

- **基金数据查询**：通过基金代码获取历史净值、单位净值、累计净值及日增长率。
- **Puppeteer 驱动**：使用无头浏览器（Headless Browser）技术，能够处理动态渲染的内容。
- **Docker 支持**：提供优化的 Dockerfile，集成 Puppeteer 环境，开箱即用。
- **自动重连**：内置浏览器实例管理，支持断开自动重连。

## 技术栈

- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [Puppeteer](https://pptr.dev/)
- [pnpm](https://pnpm.io/)

## 快速开始

### 本地开发

1. **安装依赖**：
   ```bash
   pnpm install
   ```

2. **启动开发服务器**：
   ```bash
   pnpm dev
   ```
   服务将运行在 `http://localhost:8080`。

### Docker 部署

使用 Docker 可以避免在本地配置 Puppeteer 所需的各种系统依赖。

1. **构建镜像**：
   ```bash
   docker build -t eastmoney-scraper .
   ```

2. **运行容器**：
   ```bash
   docker run -d -p 8080:8080 --name scraper eastmoney-scraper
   ```

## API 接口说明

### 获取基金历史净值

**接口地址**：`GET /api/fund/:code`

**请求参数**：
- `code` (路径参数): 6 位基金代码（例如：`000001`）。

**示例请求**：
```bash
curl http://localhost:8080/api/fund/000001
```

**成功响应**：
```json
{
  "code": "000001",
  "data": [
    {
      "date": "2024-01-05",
      "unitNetValue": "1.2345",
      "cumulativeNetValue": "3.4567",
      "dailyGrowthRate": "-0.50%"
    },
    ...
  ]
}
```

## 注意事项

- **爬虫规范**：请合理控制请求频率，遵守相关法律法规。本项目仅供学习交流使用。
- **内存占用**：Puppeteer 会启动 Chrome 实例，在低配置服务器上运行时请注意监控内存。
- **Headless 模式**：在 Docker 环境下，应用默认以 `--no-sandbox` 模式运行。

## 许可证

[Apache License 2.0](LICENSE)
