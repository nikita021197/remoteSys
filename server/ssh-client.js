/**
 * SSH клиент для подключения к удалённым устройствам
 * Использует библиотеку ssh2
 */

const { Client } = require('ssh2');

/**
 * Подключается к устройству по SSH и выполняет команду
 */
function sshConnect(config) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const timeout = setTimeout(() => {
      conn.end();
      reject(new Error('Connection timeout (15s)'));
    }, 15000);

    conn.on('ready', () => {
      clearTimeout(timeout);
      resolve(conn);
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    conn.connect({
      host: config.ip,
      port: config.port || 22,
      username: config.login,
      password: config.password,
      readyTimeout: 10000,
      algorithms: {
        kex: [
          'ecdh-sha2-nistp256',
          'ecdh-sha2-nistp384',
          'ecdh-sha2-nistp521',
          'diffie-hellman-group-exchange-sha256',
          'diffie-hellman-group14-sha256',
          'diffie-hellman-group14-sha1',
        ],
        cipher: [
          'aes128-gcm',
          'aes256-gcm',
          'aes128-ctr',
          'aes192-ctr',
          'aes256-ctr',
        ],
      },
      // Игнорируем проверку хоста для простоты
      // В production нужно использовать knownHosts
    });
  });
}

/**
 * Выполняет команду через SSH
 */
function sshExec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let stdout = '';
      let stderr = '';

      stream.on('data', (data) => {
        stdout += data.toString();
      });

      stream.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      stream.on('close', (code) => {
        resolve({ stdout, stderr, code });
      });
    });
  });
}

/**
 * Подключается и выполняет быстрое сканирование
 */
async function quickScan(config, commands) {
  let conn;
  try {
    conn = await sshConnect(config);
    const result = await sshExec(conn, commands.quickScan);
    conn.end();
    return {
      success: true,
      output: result.stdout,
      error: result.stderr
    };
  } catch (error) {
    if (conn) conn.end();
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Выполняет произвольную команду через SSH
 */
async function executeCommand(config, command) {
  let conn;
  try {
    conn = await sshConnect(config);
    const result = await sshExec(conn, command);
    conn.end();
    return {
      success: true,
      output: result.stdout,
      error: result.stderr,
      code: result.code
    };
  } catch (error) {
    if (conn) conn.end();
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Создаёт интерактивную SSH сессию для терминала
 */
function createShell(config) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      conn.shell({ term: 'xterm-256color', cols: 120, rows: 40 }, (err, stream) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }
        resolve({ conn, stream });
      });
    });

    conn.on('error', (err) => {
      reject(err);
    });

    conn.connect({
      host: config.ip,
      port: config.port || 22,
      username: config.login,
      password: config.password,
      readyTimeout: 10000,
    });
  });
}

module.exports = {
  sshConnect,
  sshExec,
  quickScan,
  executeCommand,
  createShell
};
