export * from './buildTex';

export const getStorageItem = async (key: string) => {
  const obj = await chrome.storage.sync.get([key]);
  return obj[key];
};

export const setStorageItem = async (key: string, value: string | boolean) => {
  return await chrome.storage.sync.set({ [key]: value });
};

export const toCamelCase = (str: string) => {
  let camelCaseStr = '';
  str.split(' ').forEach((word, idx) => {
    const add = word.toLowerCase();
    camelCaseStr += idx === 0 ? add : add[0].toUpperCase() + add.slice(1);
  });
  return camelCaseStr;
};

export const fetchUBCLogo = async () => {
  const res = await fetch(chrome.runtime.getURL('ubc-logo/base64.txt'));
  return await res.text();
};

export const getCourseName = async (courseName: string, campus: string) => {
  const campusAbbr = campus === 'Vancouver' ? 'UBCV' : 'UBCO';
  const [subj, code] = courseName.split(' ');
  const key = `${campusAbbr}-${subj}-${code}`;

  // check if course is in storage
  let value = await getStorageItem(key);
  if (value) return value;

  // otherwise fetch courses data
  let res;
  if (campus === 'Vancouver') {
    if (subj[0] <= 'F') {
      res = await fetch(chrome.runtime.getURL('data/UBCV_A-F.json'));
    } else {
      res = await fetch(chrome.runtime.getURL('data/UBCV_G-Z.json'));
    }
  } else {
    res = await fetch(chrome.runtime.getURL('data/UBCO.json'));
  }

  const data = await res.json();
  value = data[key];
  // cache value in storage before returning
  await setStorageItem(key, value);

  return value;
};
