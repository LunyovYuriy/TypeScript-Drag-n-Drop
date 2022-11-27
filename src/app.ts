import ProjectInput from './components/ProjectInput.js';
import ProjectList from './components/ProjectList.js';

(() => new ProjectList('active'))();
(() => new ProjectList('finished'))();
(() => new ProjectInput())();
