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

export const getCourseTitle = async (courseName: string, session: string, campus: string) => {
  const campusAbbr = campus === 'Vancouver' ? 'UBCV' : 'UBCO';
  const [subj, code] = courseName.split(' ');
  const key = `${campusAbbr}-${subj}-${code}`;

  // check if course title is in storage
  let value = await getStorageItem(key);
  if (value) return value;

  // otherwise fetch course title 
  // if course session is 2014S or later, try getting title from ./public/data/
  if (session >= '2014S') {
    let file;
    if (campusAbbr === 'UBCO') file = 'UBCO';
    else if (subj[0] <= 'F') file = 'UBCV_A-F';
    else file = 'UBCV_G-Z';

    const res = await fetch(chrome.runtime.getURL(`data/${file}.json`));
    const resJson = await res.json();
    // json data uses 3-char code; remove optional last char if length is 4
    const tmpCode = code.length === 4 ? code.slice(0, -1) : code;
    const resValue = resJson[`${subj}-${tmpCode}`];

    /*
      if resValue is an array (ordered by session in desc order), title depends on session
      e.g., resValue = [
        ["2020W", "Title A"], // sessions >= 2020W have title "Title A"
        ["2018W", "Title B"]  // sessions >= 2018W have title "Title B"
      ]
    */
    if (Array.isArray(resValue)) {
      for (const [minSession, title] of resValue) {
        if (session >= minSession) {
          value = title;
          break;
        }
        // ow, set value to title of earliest session
        value = title;
      }
    } else {
      // else resValue is a string (or undefined); course title is the same for all sessions
      value = resValue;
    }
  }

  // set undefined or empty values
  if (!value) value = '---';

  // cache course title in storage before returning
  await setStorageItem(key, value);

  return value;
};
