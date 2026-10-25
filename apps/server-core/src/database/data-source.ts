import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadRuntimeConfig } from '../configuration/environment.js';
import { databaseOptions } from './options.js';

/** CLI entry point; importing application factories does not read local secrets. */
export default new DataSource(databaseOptions(loadRuntimeConfig()));
