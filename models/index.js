import * as postgresql from './postgresql/index.js';

const mappers = {
    postgresql,
};

export function getModelMapper(dbType) {
    return mappers[dbType] || null;
}