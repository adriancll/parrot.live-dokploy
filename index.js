const fs = require('mz/fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { Readable } = require('stream');
const colors = require('colors/safe');

// Setup frames in memory
let original = [];
let flipped = [];

(async () => {
  const framesPath = 'frames';
  const files = await fs.readdir(framesPath);

  original = await Promise.all(files.map(async (file) => {
    const frame = await fs.readFile(path.join(framesPath, file));
    return frame.toString();
  }));
  flipped = original.map(f => {
    return f
      .toString()
      .split('')
      .reverse()
      .join('')
  })
})().catch((err) => {
  console.log('Error loading frames');
  console.log(err);
});

const colorsOptions = [
  'red', 'yellow', 'green', 'blue', 
  'magenta', 'cyan', 'white'
];
const numColors = colorsOptions.length;
const selectColor = previousColor => {
  let color;
  do {
    color = Math.floor(Math.random() * numColors);
  } while (color === previousColor);
  return color;
};

function streamer(stream, opts) {
  const frames = opts.flip ? flipped : original;
  let index = 0;
  let lastColor;
  let timer;

  function tick() {
    // Full screen clear + rainbow colors RESTORED
    stream.push('\u001b[2J\u001b[3J\u001b[H');
    
    const colorIdx = lastColor = selectColor(lastColor);
    const coloredFrame = colors[colorsOptions[colorIdx]](frames[index]);
    
    const ok = stream.push(coloredFrame);
    index = (index + 1) % frames.length;

    if (ok) {
      timer = setTimeout(tick, 70);
    } else {
      stream.once('drain', () => {
        timer = setTimeout(tick, 70);
      });
    }
  }

  tick();
  return () => clearTimeout(timer);
}

const validateQuery = ({ flip }) => ({ 
  flip: String(flip).toLowerCase() === 'true' 
});

const server = http.createServer((req, res) => {
  // Healthcheck route
  if (req.url === '/healthcheck') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  // CURL-ONLY + ?parrot=1 bypass (rainbow colors!)
  const query = url.parse(req.url, true).query;
  const userAgent = req.headers['user-agent'] || '';
  const isCurl = userAgent.includes('curl');
  const forceParrot = query.parrot === '1';

  if (!isCurl && !forceParrot) {
    res.writeHead(302, { Location: 'https://github.com/hugomd/parrot.live' });
    return res.end();
  }

  // RAINBOW PARROT for curl users only 🦜🌈
  const stream = new Readable({ read() {} });
  res.writeHead(200, { 
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store, no-cache'
  });
  stream.pipe(res);

  const opts = validateQuery(query);
  const cleanupLoop = streamer(stream, opts);

  const onClose = () => {
    cleanupLoop();
    stream.destroy();
  };
  res.on('close', onClose);
  res.on('error', onClose);
});

const port = process.env.PORT || process.env.PARROT_PORT || 3000;
server.listen(port, err => {
  if (err) throw err;
  console.log(`🦜 CURL-ONLY Rainbow Parrot on http://localhost:${port}`);
});
