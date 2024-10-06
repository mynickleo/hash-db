let dataBase = {};

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ?
            r : ( r & 0x3 | 0x8 );
            return v.toString(16);
        })
}

function isUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

function createTable(payload) {
    if (checkTable(payload.name, true)) {
        throw new Error('Table is already exists');
    }
    if (!payload.name) {
        throw new Error('Table name was expected');
    }
    if (!payload.body) {
        throw new Error('Table body was expected');
    }
    dataBase[payload.name] = { body: payload.body, entities: {} };

    return dataBase[payload.name];
}

function checkTable(tableName, isCreate) {
    if (!dataBase[tableName]) {
        if (isCreate) {
            return false;
        }
        throw new Error(`Table ${tableName} not exists`);
    }
    return true;
}

function create(tableName, payload) {
    checkTable(tableName);
    for (const key in dataBase[tableName].body) {
        if (dataBase[tableName].body[key] != true) {
            continue;
        }
        if (!payload[key]) {
            throw new Error(`${key} was expected`);
        }
        if (typeof payload[key] != dataBase[tableName].body[key]){
            throw new Error(`${dataBase[tableName].body[key]} type for ${key} was expected`);
        }
    }

    if (dataBase[tableName].body.timestamps) {
        const createDate = new Date().toISOString();
        payload.createdAt = createDate;
        payload.updatedAt = createDate;
    }
    
    const uuid = generateUUID();
    dataBase[uuid] = payload;
    dataBase[tableName].entities = { ...dataBase[tableName].entities, [Object.keys(dataBase[tableName].entities).length]: uuid };

    return dataBase[uuid];
}

function update(tableName, id, payload) {
    checkTable(tableName);
    if (!dataBase[id]) {
        throw new Error(`Entity with id = ${id} not exists`)
    }

    for (const key in payload) {
        dataBase[id][key] = payload[key]; 
    }

    if (dataBase[id]['updatedAt']) {
        const updateDate = new Date().toISOString();
        dataBase[id]['updatedAt'] = updateDate;
    }

    return 'OK';
}

function getOneById(id) {
    if (!dataBase[id]) {
        throw new Error(`Entity with id = ${id} not exists`)
    }
    return dataBase[id];
}

function getMany(tableName, query) {
    checkTable(tableName);
    const entitiesIds = dataBase[tableName].entities;
    const entities = {};

    for (const id of Object.values(entitiesIds)) {
        if (query) {
            const value = Number(dataBase[id][query.key]) ? dataBase[id][query.key] : dataBase[id][query.key].toLocaleLowerCase();
            if (value == query.value) {
                entities[id] = dataBase[id];
            }
        } else {
            entities[id] = dataBase[id];
        }
    }
    return entities;
}

function getDBTables() {
    const tables = [];
    for (const id of Object.keys(dataBase)) {
        if (!isUUID(id)) {
            tables.push(id);
        }
    }
    return tables;
}

function dropTable(tableName) {
    delete dataBase[tableName];
}

function describeTable(tableName) {
    if (!isUUID(tableName)) {
        return dataBase[tableName] ?? {};
    } else {
        return {};
    }
}

function saveDataBase() {
    localStorage.setItem('hash-db', JSON.stringify(dataBase));
}

function loadDataBase() {
    const db = localStorage.getItem('hash-db');
    dataBase = JSON.parse(db);
}

function dropDataBase() {
    dataBase = {};
}