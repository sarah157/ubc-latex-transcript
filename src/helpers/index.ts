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

  // most courses will be in public/data/, which contains courses offered in 2014S and/or later.
  let file;
  if (campusAbbr === 'UBCO') file = 'UBCO';
  else if (subj[0] <= 'D') file = 'UBCV_A-D';
  else if (subj[0] <= 'L') file = 'UBCV_E-L';
  else file = 'UBCV_M-Z';

  let resValue: string[][] | string | undefined;
  try {
    const res = await fetch(chrome.runtime.getURL(`data/${file}.json`));
    const resJson = await res?.json();
    // json data uses 3-char code; remove optional last char if length is 4
    const tmpCode = code.length === 4 ? code.slice(0, -1) : code;
    if (resJson) resValue = resJson[`${subj}-${tmpCode}`];
  } catch (e) {
    console.log(`[UBC LaTeX Transcript] Error fetching data/${file}.json.`);
  }

  // if resValue is an array of type string[][] (ordered by session in desc order), the title depends on session
  // e.g., resValue = [
  //    ["2020W", "Title A"], // sessions >= 2020W have title "Title A"
  //    ["2018W", "Title B"]  // sessions >= 2018W (and < 2020W) have title "Title B"
  //  ]
  if (Array.isArray(resValue)) {
    for (const [minSession, title] of resValue) {
      value = title;
      // break when course's session is >= current session
      if (session >= minSession) break;
    }
  } else {
    // else resValue is a string (or undefined); course title is the same for all sessions
    value = resValue;
  }

  // if course is not in public/data/ (e.g., it is only offered in sessions earlier than 2014), try the UBCGrades API
  if (!value) {
    try {
      let res;
      if (session >= '2021S') {
        // v3 api; sessions 2021S and later
        res = await fetch(`https://ubcgrades.com/api/v3/grades/${campusAbbr}/${session}/${subj}/${code}`);
      }
      if (!res?.ok && session >= '2014') {
        // v2 api; sessions 2014S to 2021W (incl.)
        res = await fetch(`https://ubcgrades.com/api/v2/grades/${campusAbbr}/${session}/${subj}/${code}`);
      }
      if (!res?.ok && campusAbbr === 'UBCV') {
        // v1 api; only supports UBCV; sessions 1996S to 2018W (incl.)
        // some courses (e.g., Coop Placements) are only in v1 api
        res = await fetch(`https://ubcgrades.com/api/v1/grades/UBCV/${session}/${subj}/${code}`);
      }
      if (res?.ok) {
        const resJson = await res.json();
        if (resJson.length) value = resJson[0]?.course_title;
      }
    } catch (e) {
      console.log(`[UBC LaTeX Transcript] Error fetching '${session} ${courseName}' from UBCGrades API.`);
    }
  }

  // cache course title in storage before returning
  await setStorageItem(key, value);

  return value;
};
