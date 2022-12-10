import ProjectInput from './components/ProjectInput';
import ProjectList from './components/ProjectList';

(() => new ProjectList('active'))();
(() => new ProjectList('finished'))();
(() => new ProjectInput())();
