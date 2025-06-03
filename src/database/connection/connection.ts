import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBInstance = async () => {
  return SQLite.openDatabase({name: 'quickChat.db', location: 'Documents'});
};
