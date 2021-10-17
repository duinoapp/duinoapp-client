import moment from 'dayjs';
import { v3 as uuid3 } from 'uuid';

const namespaces = {
  projects: '12c23615-bdde-4b08-a9b5-eff94ee77c64',
  files: 'e54e6456-3120-4d4c-8e91-cf3054c6790b',
  servers: '6e2c0d79-f9da-4840-bdc2-a4beb6eb3383',
  cores: 'ca286417-59ec-4a98-bfff-26b0c722ecca',
  boards: 'd0d642b5-5d32-46a7-a269-96e5776046a2',
  libraries: '404e901a-0521-47f5-8fcf-74f7f7a1dfc9',
  settings: 'db2c24d8-1d30-4176-bf09-709f4c251239',
};

export const genId = (value, serv) => uuid3(value, namespaces[serv]);

export const meta = () => ({
  get createdAt() {
    return () => moment(this.meta.createdAt);
  },
  get updatedAt() {
    return () => moment(this.meta.createdAt);
  },
  get currentAt() {
    return () => moment(this.meta.createdAt);
  },
  meta: {
    createdAt: moment().toJSON(),
    updatedAt: moment().toJSON(),
    currentAt: moment().toJSON(),
  },
});

export const settingsDefaults = {
  editor: {
    autoSaveInterval: 10,
    theme: 'vs',
    fontSize: 14,
    wordWrap: 'off',
    scrollBeyondLastLine: true,
  },
  compiler: {
    verbose: false,
  },
  monitor: {
    encoding: 'ascii',
  },
};
