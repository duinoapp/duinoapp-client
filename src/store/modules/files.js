/* eslint-disable no-param-reassign */
import slugify from 'slugify';
import socket from '../socket';

export default {
  namespaced: true,
  state: {
    items: {
      name: 'blink/blink.ino',
      content: `
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000); // I'm in milliseconds so 1000ms = 1 second!
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000); // Try changing me to 500
}
`,
    },
    projects: { blink: { name: 'Blink Example', desc: 'Beginner Test Blink. Become a coder in the blink of an eye!', id: 'blink' } },
    currentProjectId: 'blink',
    currentFileId: 'blink/blink.ino',
  },

  mutations: {
    createFile(state, file) {
      state.items[file.name] = file;
    },
    removeFile(state, fileName) {
      delete state.items[fileName];
    },
    renameFile(state, { oldName, newName }) {
      state.items[newName] = Object.assign({}, state.items[oldName], { name: newName });
      delete state.items[oldName];
    },
    changeFile(state, { name, content }) {
      state.items[name] = Object.assign({}, state.items[name], { content });
    },
    setCurrentFile(state, name) {
      state.currentProjectId = name;
    },
    createProject(state, proj) {
      if (proj.id) proj.id = slugify(proj.name);
      state.projects[proj.id] = proj;
    },
    removeProject(state, id) {
      delete state.items[id];
      if (state.currentProjectId === id) {
        state.currentProjectId = Object.keys(state.projects).shift();
      }
    },
    changeProject(state, proj) {
      state.projects[proj.id] = Object.assign({}, state.projects[proj.id], proj);
    },
    setCurrentProject(state, id) {
      state.currentProjectId = id;
    },
  },

  getters: {
    currentProject(state) {
      return state.projects[state.currentProjectId];
    },
    currentFile(state) {
      return state.items[state.currentFileId];
    },
    currentFiles(state) {
      return Object.values(state.items).filter(f => f.name.indexOf(`${state.currentProjectId}/`) === 0);
    },
    currentFilesTree(state) {
      return Object.values(state.items).filter(f => f.name.indexOf(`${state.currentProjectId}/`) === 0);
    },
  },

  actions: {
    sendFiles(context) {
      const projectFiles = Object.values(context.state.items).filter(f => f.name.indexOf(`${context.state.currentProjectId}/`) === 0);
      return socket.emitAsync('files.new', projectFiles);
    },
    setSketch(context) {
      return socket.emitAsync('files.setSketch', `${context.state.currentProject}/`);
    },
    async precompile(context) {
      await socket.emitAsync('files.setSketch', `${context.state.currentProject}/`);
      const projectFiles = Object.values(context.state.items).filter(f => f.name.indexOf(`${context.state.currentProjectId}/`) === 0);
      await socket.emitAsync('files.new', projectFiles);
    },
  },
};
