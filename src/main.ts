import express, { Request, Response } from 'express';
import puppeteer, { Browser } from 'puppeteer';

const app = express();
const port = 8080;

let browser: Browser | null = null;

// Function to initialize Puppeteer browser
const initBrowser = async () => {
  if (browser) return; // Already initialized

  try {
    browser = await puppeteer.launch({
      headless: true, // Use headless mode for server
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Puppeteer browser launched.');

    // Listen for disconnection (crash)
    browser.on('disconnected', () => {
      console.log('Browser disconnected! Attempting to reconnect...');
      browser = null;
      initBrowser();
    });

  } catch (err) {
    console.error('Failed to launch browser:', err);
    // Retry after a short delay if launch fails
    setTimeout(initBrowser, 5000);
  }
};

// Initial launch
initBrowser();

app.get('/api/fund/:code', async (req: Request, res: Response): Promise<any> => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: 'Missing fund code.' });
  }

  // Ensure browser is ready
  if (!browser || !browser.isConnected()) {
    console.log('Browser not ready, initializing...');
    await initBrowser();
    if (!browser) {
       return res.status(503).json({ error: 'Service unavailable, browser is restarting.' });
    }
  }

  const url = `https://fundf10.eastmoney.com/jjjz_${code}.html`;
  console.log(`Received request for fund code: ${code}. Navigating to ${url}...`);

  let page;
  try {
    page = await browser.newPage();
    
    // Set a timeout for navigation
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for the table selector, fast fail if not found
    try {
        await page.waitForSelector('.lsjz tbody tr', { timeout: 5000 });
    } catch (e) {
        // If selector is not found, it might be an invalid code or empty page
        return res.status(404).json({ error: 'Fund data not found or invalid code.' });
    }

    // Extract data from the table
    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.lsjz tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 4) return null;
        return {
          date: cells[0]?.innerText.trim(),
          unitNetValue: cells[1]?.innerText.trim(),
          cumulativeNetValue: cells[2]?.innerText.trim(),
          dailyGrowthRate: cells[3]?.innerText.trim(),
        };
      }).filter(item => item !== null);
    });

    const title = await page.title();
    // 清洗标题：从 "广发纯债债券A(270048)基金历史净值 _ 基金档案 _ 天天基金网"
    // 提取出 "广发纯债债券A(270048)"
    let cleanedName = title.split('_')[0] || title;
    cleanedName = cleanedName.replace('基金历史净值', '');

    res.json({
      code,
      name: cleanedName.trim(),
      data
    });

  } catch (error: any) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    if (page) {
      await page.close();
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing browser...');
  if (browser) await browser.close();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});