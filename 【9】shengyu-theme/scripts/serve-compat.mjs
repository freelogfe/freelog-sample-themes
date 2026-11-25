import { build, preview } from 'vite';

// Watch classic bundles rather than serving the ESM-only Vite dev client.
const watcher = await build({ mode: 'compat', build: { watch: {} } });
let server;
let starting = false;
watcher.on('event', async event => {
  if (event.code === 'ERROR') console.error(event.error);
  if (event.code !== 'END') return;
  if (server) return console.log('兼容构建已更新，请刷新节点页面。');
  if (starting) return;
  starting = true;
  try {
    server = await preview({ mode: 'compat' });
    server.printUrls();
    console.log('兼容调试已启动：无需更改节点 bundleTool，修改代码后等待构建完成并刷新。');
  } catch (error) {
    console.error(error);
    await watcher.close();
    process.exitCode = 1;
  }
});
async function close() {
  await watcher.close();
  server?.httpServer.close();
}
process.once('SIGINT', close);
process.once('SIGTERM', close);
