import LocalForage from 'localforage';

LocalForage.config({
  driver: [LocalForage.INDEXEDDB, LocalForage.LOCALSTORAGE],
  name: 'HeaderDX',
  storeName: 'header_system',
});

export default LocalForage;
