const log4js = require('log4js');
var logger = log4js.getLogger('default');
logger.level = 'all';
logger.debug('Loaded module: log4js');
logger.debug('Logger has been initialized');
const arg = process.argv.slice(2);
logger.debug(`Received arguments: ${JSON.stringify(arg)}`);
const fs = require('fs');
logger.debug('Loaded module: fs');
const path = require('path');
logger.debug('Loaded module: path');
const { exec } = require('child_process');
const { spawn } = require('child_process');
logger.debug('Loaded module: child_process');
const request = require('request');
logger.debug('Loaded module: request');
const sqlite3 = require("sqlite3");
logger.debug('Loaded module: sqlite3');
const db = new sqlite3.Database('db/master.db');
logger.debug('SQLite database has been initialized');

function showErrorMsg (id) {
  const errorMsgList = {
    '0001': 'Invalid command',
    '0002': 'Invalid argument'
  };
  logger.error(`Error: ${errorMsgList[id]}`);
}

function showHelpMsg () {
  logger.debug('Help displayed');
  let commandList = [
    'help',
    'saveAllDatabaseTableToJsonFile',
    'saveAllDatabaseTableToIntegratedFile'
  ];
  console.log(`\nUsage: node ${path.basename(process.argv[1])} COMMAND [VALUE]\n\nCommands:\n  ${commandList.join('\n  ')}`);
}

function saveAllDatabaseTableToJsonFile () {
  logger.debug(`Checking for the existence of 'db/master.db' ...`);
  fs.exists(`db/master.db`, (exists) => {
    if (exists) {
      logger.debug(`'db/master.db' file found`);
      logger.debug(`Checking for the existence of 'db/json/' ...`);
      fs.exists(`db/json`, (exists) => {
        if (!exists) {
          logger.debug(`'db/json' directory not found`);
          fs.mkdir(`db/json`, {recursive: true}, (err) => {
            if (err) throw err;
            logger.debug(`'db/json/' directory created`);
          });
        } else {
          logger.debug(`'db/json' directory found`);
        }
      });
      logger.debug(`Loading database ...`);
      db.serialize(() => {
        db.each("SELECT name FROM sqlite_master WHERE type='table'", function (err, table) {
          if (err) throw err;
          let tableName = table.name;
          logger.debug(`Database table '${tableName}' loaded successfully`);
          db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) throw err;
            fs.exists(`db/json/${tableName}.json`, (exists) => {
              logger.debug(`Checking for the existence of 'db/json/${tableName}.json' ...`);
              if (exists) {
                logger.debug(`'db/json/${tableName}.json' file found`);
                logger.debug(`Overwriting 'db/json/${tableName}.json' file ...`);
                fs.unlink(`db/json/${tableName}.json`, (err) => {});
                fs.writeFile(`db/json/${tableName}.json`, JSON.stringify(rows), {flag: 'a'}, (err) => {
                  if (err) throw err;
                });
              } else {
                logger.debug(`'db/json/${tableName}.json' file not found`);
                logger.debug(`Creating 'db/json/${tableName}.json' file ...`);
                fs.writeFile(`db/json/${tableName}.json`, JSON.stringify(rows), {flag: 'a'}, (err) => {
                  if (err) throw err;
                });
              }
            });
          });
        });
      });
      db.close();
    } else {
      logger.error(`'db/master.db' file not found`);
    }
  });
}

function saveAllDatabaseTableToIntegratedFile() {
  const outputJson = {};
  logger.debug(`Loading database ...`);
  db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY NAME`, (err, tableRaw) => {
    if (err) {
      throw err;
    }
    logger.debug(`Database loaded successfully`);
    const tablesName = tableRaw.map((row) => row.name);
    logger.debug(`Loaded table list: ${JSON.stringify(tablesName)}`);
    tablesName.forEach((tableName) => {
      db.all(`SELECT * FROM ${tableName}`, (err, tableData) => {
        if (err) {
          throw err;
        }
        outputJson[tableName] = tableData;
        logger.debug(`Integrated table: ${tableName}`);
        if (Object.keys(outputJson).length === tablesName.length) {
          fs.writeFile(`db/master.json`, JSON.stringify(outputJson), (error) => {
            if (error) {
              throw error;
            }
            logger.debug(`Wrote 'db/master.json'`);
            logger.info('Process completed');
          });
        }
      });
    });
  });
}

if (arg.length === 0) {
  showHelpMsg();
} else {
  if (arg[0] === 'help') {
    showHelpMsg();
  } else if (arg[0] === 'saveAllDatabaseTableToJsonFile') {
    saveAllDatabaseTableToJsonFile();
  } else if (arg[0] === 'saveAllDatabaseTableToIntegratedFile') {
    saveAllDatabaseTableToIntegratedFile();
  } else {
    showErrorMsg('0001');
  }
}