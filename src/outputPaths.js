import path from 'path';
const base = path.dirname(new URL(import.meta.url).pathname);

export default {
  html: path.join(base, 'index.html'),
  raw: path.join(base, 'page_raw.html'),
  captcha: path.join(base, 'captcha_page.html'),
  error: path.join(base, 'error_page.html'),
  log: path.join(base, 'error.log'),
  dataJson: path.join(base, 'data.json'),
};

