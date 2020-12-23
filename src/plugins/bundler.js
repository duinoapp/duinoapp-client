/* eslint-disable class-methods-use-this */
// import moment from 'dayjs';
import {
  zip, unzip, strToU8, strFromU8,
} from 'fflate';
import { saveAs } from 'file-saver';

const getType = (ref) => {
  switch (ref.split('.').pop()) {
    case 'ino':
      return 'text/x-arduino';
    case 'c':
    case 'cpp':
    case 'h':
      return 'text/x-c';
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    default:
      return '';
  }
};

class Bundler {
  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.$bundler = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$bundler = this;
    this.Vue = Vue;
  }

  async createFile(project, fileObj, pathName, main) {
    const { File } = this.Vue.$FeathersVuex.api;
    const contentType = getType(pathName);
    if (!contentType) return;
    const file = new File({
      name: main ? `${project.ref}.ino` : pathName,
      ref: main ? `${project.ref}/${project.ref}.ino` : `${project.ref}/${pathName}`,
      body: strFromU8(fileObj),
      contentType,
      main,
      projectId: project.uuid,
    });
    await file.save();
  }

  async unzipFile(zipFile) {
    const zipArr = new Uint8Array(await zipFile.arrayBuffer());
    return new Promise((resolve, reject) => unzip(zipArr, (err, res) => (err ? reject(err) : resolve(res))));
  }

  async importProjectFiles(project, unzipped, inoFile) {
    const fileNames = Object.keys(unzipped);
    const inoPath = inoFile.replace(/\/[^/]+.ino$/, '');
    await Promise.all(
      fileNames
        .filter((i) => !inoPath || i.indexOf(`${inoPath}/`) === 0)
        .map((i) => this.createFile(project, unzipped[i], i.replace(`${inoPath}/`, ''), i === inoFile)),
    );
    return project;
  }

  async exportProject(project) {
    const { File } = this.Vue.$FeathersVuex.api;
    const { data: files } = File.findInStore({ query: { projectId: project.uuid } });
    // eslint-disable-next-line no-param-reassign
    const fileObj = files.reduce((a, file) => { a[file.ref] = strToU8(file.body); return a; }, {});
    // eslint-disable-next-line no-console
    console.log(files, fileObj);
    const zipped = await new Promise((resolve, reject) => zip(fileObj, (err, res) => (err ? reject(err) : resolve(res))));
    // eslint-disable-next-line no-console
    console.log(zipped);
    saveAs(new Blob([zipped.buffer]), `${project.ref}.zip`);
  }
}

export default new Bundler();
