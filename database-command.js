const commandInput = document.getElementById('command');
const infoMessage = document.getElementById('info-message');
const commandMessage = document.getElementById('command-message');

const commands = ['create - tables, entity; update - entity; get - tables, table, entity; describe - table; drop - db, table; db - save, load'];

commandInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        commandMessage.innerHTML = `<h3>$command:</h3> ${commandInput.value}`;
        handleCommand(commandInput.value);
    }
  });

function handleCommand(value) {
    const command = value.toLocaleLowerCase().split(' ');

    try {
        switch (command[0]) {
            case "create":
                if (command[1] == 'table') {
                    command.splice(0, 2)
                    buildPayloadAndCreate(command, true);
                }
                else if (command[1] == 'entity') {
                    command.splice(0, 2)
                    buildPayloadAndCreate(command, false);
                } else {
                    infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
                }
            break;
            
            case "get":
                if (command[1] == 'table') {
                    if (command[3] == 'where') {
                        command.splice(0, 2)
                        getTable(command, true)
                    } else {
                        command.splice(0, 2)
                        getTable(command);
                    }
                } else if (command[1] == 'entity') {
                    command.splice(0, 2)
                    getEntity(command);
                } else if (command[1] == 'tables') {
                    command.splice(0, 2);
                    getTables();
                } else {
                    infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
                }
            break;

            case "save":
                if (command[1] == 'db') {
                    save();
                } else {
                    infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
                }
            break;

            case "load":
                if (command[1] == 'db') {
                    load();
                } else {
                    infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
                }
            break;

            case "drop":
                if (command[1] == 'db') {
                    drop();
                } else if (command[1] == 'table') {
                    command.splice(0, 2);
                    dropTableFromDB(command);
                } else {
                    infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
                }
            break;

            case "update":
                if (command[1] == 'entity') {
                    command.splice(0, 2);
                    buildPayloadAndUpdateEntity(command);
                } else {
                    infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
                }
            break;

            case "help": 
                infoMessage.innerHTML = `<h3>$info:</h3> commands: ${commands}`;
            break;

            case "describe":
                if (command[1] == 'table') {
                    command.splice(0, 2);
                    describeTableFromDB(command);
                } else {
                    infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
                }
            break;

            default:
                infoMessage.innerHTML = `<h3>$info:</h3> command is undefined`;
            break;
        }
    } catch (error) {
        infoMessage.innerHTML = `<h3>$info:</h3> ${error}`;
    }

    commandInput.value = '';
}

function buildPayloadAndCreate(command, isTable) {
    const payload = {};
    
    if (command[0] == '') {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
    }

    payload.name = command[0];
    command.splice(0, 1);

    if (command.length % 2 != 0) {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
    }

    for (let i = 0; i < command.length; i = i + 2) {
        const data = Number(command[i + 1]) ? Number(command[i + 1]) : command[i + 1];
        payload.body = { ...payload.body, [command[i]] : data };
    }

    if (isTable) {
        const table = createTable(payload);
        infoMessage.innerHTML = `<h3>$info:</h3> Table ${payload.name} was created: <p>${JSON.stringify(table, null, 2)}</p>`;
    } else {
        const entity = create(payload.name, payload.body);
        infoMessage.innerHTML = `<h3>$info:</h3> Entity table ${payload.name} was created: <p>${JSON.stringify(entity, null, 2)}</p>`;
    }
}

function getTable(command, isQuery) {
    if (command[0] == '') {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
        return;
    }

    const tableName = command[0];
    let table = null;
    if (isQuery) {
        command.splice(0, 2);
        const key = command[0];
        const value = command[1];
        if (!key || !value) {
            infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
            return;
        }

        const query = { key, value };
        table = getMany(tableName, query);
    } else {
        table = getMany(tableName);
    }

    infoMessage.innerHTML = `<h3>$info:</h3> Entities table ${tableName}: <p>${JSON.stringify(table, null, 2)}</p>`;
}

function getEntity(command) {
    if (command[0] == '') {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
    }

    const entity = getOneById(command[0]);
    infoMessage.innerHTML = `<h3>$info:</h3> Entity ${command[0]}: <p>${JSON.stringify(entity, null, 2)}</p>`;
}

function getTables() {
    const tables = getDBTables();
    infoMessage.innerHTML = `<h3>$info:</h3> Tables in DB: <p>${JSON.stringify(tables, null, 2)}</p>`;
}

function save() {
    saveDataBase();
    infoMessage.innerHTML = `<h3>$info:</h3> DataBase was successfully saved`;
}

function load() {
    loadDataBase();
    infoMessage.innerHTML = `<h3>$info:</h3> DataBase was successfully loaded`;
}

function drop() {
    dropDataBase();
    infoMessage.innerHTML = `<h3>$info:</h3> DataBase was successfully dropped`;
}

function buildPayloadAndUpdateEntity(command) {
    const payload = {};
    
    if (command[0] == '' && command[1] == '') {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
    }

    payload.name = command[0];
    payload.id = command[1];

    command.splice(0, 2);

    if (command.length % 2 != 0) {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
    }

    for (let i = 0; i < command.length; i = i + 2) {
        const data = Number(command[i + 1]) ? Number(command[i + 1]) : command[i + 1];
        payload.body = { ...payload.body, [command[i]] : data };
    }
    
    const entity = update(payload.name, payload.id, payload.body);
    infoMessage.innerHTML = `<h3>$info:</h3> OK`;
}

function dropTableFromDB(command) {
    if (command[0] == '') {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
    }
    
    dropTable(command[0]);
    infoMessage.innerHTML = `<h3>$info:</h3> Table ${command[0]} was successfully dropped`;
}

function describeTableFromDB(command) {
    if (command[0] == '') {
        infoMessage.innerHTML = '<h3>$info:</h3> Press all fields correct';
    }

    const table = describeTable(command[0]);
    infoMessage.innerHTML = `<h3>$info:</h3> Table ${command[0]}: <p>${JSON.stringify(table, null, 2)}</p>`;
}