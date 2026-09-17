import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';
const OUT_DIR = path.resolve('doc_assets');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching browser with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: {
      width: 1366,
      height: 768,
      deviceScaleFactor: 2
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();

  // 1. Capture Login Page
  console.log('Navigating to Login Page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  const loginPath = path.join(OUT_DIR, 'fig_ui_login.jpg');
  await page.screenshot({ path: loginPath, type: 'jpeg', quality: 95 });
  console.log(`Saved: ${loginPath}`);

  // 2. Log in as Bursar / Admin & Capture Admin Dashboard
  console.log('Logging in as Bursar...');
  // Click on the Bursar Account preset button
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Bursar Account')) {
      await b.click();
      break;
    }
  }
  await sleep(500);

  // Click Submit Sign In
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
  }
  await sleep(2000);

  // We are now on /admin/dashboard
  console.log('Capturing Admin Dashboard at /admin/dashboard...');
  const adminPath = path.join(OUT_DIR, 'fig_ui_admin_dashboard.jpg');
  await page.screenshot({ path: adminPath, type: 'jpeg', quality: 95 });
  console.log(`Saved: ${adminPath}`);

  // 3. Open Payments List and capture Receipt Modal
  console.log('Navigating to /admin/payments to capture Digital Receipt Modal...');
  await page.goto(`${BASE_URL}/admin/payments`, { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Click on the first "Receipt" button
  const receiptButtons = await page.$$('button');
  for (const b of receiptButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Receipt')) {
      await b.click();
      console.log('Clicked Receipt button!');
      break;
    }
  }
  await sleep(1500);

  const receiptPath = path.join(OUT_DIR, 'fig_ui_digital_receipt.jpg');
  await page.screenshot({ path: receiptPath, type: 'jpeg', quality: 95 });
  console.log(`Saved: ${receiptPath}`);

  // 4. Log in as Parent and open Paystack Modal
  console.log('Navigating to /login to log in as Parent...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await sleep(1000);

  const parentButtons = await page.$$('button');
  for (const b of parentButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Parent (Email)')) {
      await b.click();
      break;
    }
  }
  await sleep(500);

  const parentSubmitBtn = await page.$('button[type="submit"]');
  if (parentSubmitBtn) {
    await parentSubmitBtn.click();
  }
  await sleep(2000);

  // Navigate to first student payment page
  console.log('Navigating to /parent/students/s-1/pay...');
  await page.goto(`${BASE_URL}/parent/students/s-1/pay`, { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Click Launch Paystack Gateway
  const paystackTrigger = await page.$('button[type="submit"]');
  if (paystackTrigger) {
    await paystackTrigger.click();
    console.log('Clicked Launch Paystack Gateway!');
  }
  await sleep(1500);

  const parentPayPath = path.join(OUT_DIR, 'fig_ui_parent_payment.jpg');
  await page.screenshot({ path: parentPayPath, type: 'jpeg', quality: 95 });
  console.log(`Saved: ${parentPayPath}`);

  await browser.close();
  console.log('All actual screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
