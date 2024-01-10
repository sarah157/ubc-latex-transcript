import { getCourseTitle, toCamelCase } from './helpers';
import { buildTex } from './buildTex';
import {
  Session,
  SessionValues,
  Course,
  CourseColumn,
  Student,
  Options,
  Campus,
  NBSP
} from './types';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'GENERATE_TRANSCRIPT') {
    generateTranscript(request.options).then((data) => sendResponse({ data }));
  }
  return true;
});

const generateTranscript = async (options: Options) => {
  const { student, sessions, allCourses, isStdgColEmpty } = await parseDataFromDOM(options);
  const latexTranscript = buildTex(student, sessions, allCourses, options, isStdgColEmpty);
  // return base64-encoded transcript
  return btoa(latexTranscript);
};

const parseDataFromDOM = async (options: Options) => {
  const student: Student = {};
  const sessions: Session[] = [];
  // allCourses[i] is an array of courses for session at sessions[i]
  const allCourses: Course[][] = [];
  const iframe: HTMLIFrameElement = document.querySelector('#iframe-main');

  // parse student info
  const studentEl: Element = document.querySelector('#ubc7-unit-name > span.pull-right',);
  student.name = studentEl?.textContent.split('\n')[2].trim().split('Name: ')[1];
  student.number = studentEl?.textContent.split('\n')[3].trim().split('Student #: ')[1];

  // Some course codes have a 4th character (e.g., CPSC 436A). The correct code is only displayed 
  // in the 'All Sessions' tab (the individual session tab shows the course as CPSC 436).
  // To ensure the correct code is being used, (1) read the 'All Sessions' tab to save
  // course codes with a 4th char. (2) then read individual session tabs and update course code if needed
  const allSessionsCoursesColl = iframe.contentWindow.document.querySelector('#tabs-all tbody').children;

  // map course to 4th char in code e.g., { 'CPSC 436' : 'A' }
  const courseToCode4thChar: { [key: string]: string } = {};

  // we must also save the program code (e.g., BSC) which will be used instead of the 
  // full program name if options.groupBySession is false
  // map session to program code
  const sessionToProgramCode: { [key: string]: string } = {};

  // (1) iterate through courses in All Sessions; start at crs = 1 to skip header
  for (let crs = 1; crs < allSessionsCoursesColl.length; crs++) {
    const courseColl: HTMLCollection = allSessionsCoursesColl[crs].children;
    // if course code has length of 4, save course to map 
    const courseName = courseColl[0].textContent.trim().replace(NBSP, ' ');
    const code = courseName.split(' ')[1];
    if (code.length === 4) {
      courseToCode4thChar[courseName.slice(0, -1)] = courseName.slice(-1);
    }
    // update sessionToProgramCode map
    const sessionName = courseColl[4].textContent.trim();
    const programCode = courseColl[6].textContent.trim();
    sessionToProgramCode[sessionName] = programCode;
  }

  // (2) iterate through all individual session tabs to parse session and course details
  const sessionTabsColl: HTMLCollection = iframe.contentWindow.document.querySelector('#tabs').children;

  // used to determine if standing col should be dropped if empty
  let isStdgColEmpty = true;

  // start at i = 2 to skip tabs-list and tabs-all
  for (let i = 2; i < sessionTabsColl.length; i++) {
    const session = parseSession(sessionTabsColl[i]);
    // update program full name to program code if courses should not be grouped by session
    if (!options.groupBySession) {
      session.program = sessionToProgramCode[session.name] || '';
    }
    sessions.push(session);

    // iterate through current session's courses
    const sessionCoursesColl: HTMLCollection = sessionTabsColl[i].querySelector('tbody').children;
    const currCourses = [];
    for (let crs = 0; crs < sessionCoursesColl.length; crs++) {
      if (sessionCoursesColl[crs].classList.contains('listRow')) {
        const course = await parseCourse(sessionCoursesColl[crs], session);
        // update course name if code has 4 characters
        if (course[CourseColumn.NAME] in courseToCode4thChar) {
          course[CourseColumn.NAME] += courseToCode4thChar[course[CourseColumn.NAME]];
        }
        // if specified in options, drop CDF or W courses
        const courseStanding = course[CourseColumn.STANDING];
        if (courseStanding.length > 0) {
          if (options.dropWCourses && courseStanding[0] === 'W') continue;
          if (options.dropCdfCourses && ['C', 'D', 'F'].includes(courseStanding[0])) continue;
          isStdgColEmpty = false;
        }
        currCourses.push(course);
      }
    }
    allCourses.push(currCourses);
  }

  return { student, sessions, allCourses, isStdgColEmpty };
};

const parseSession = (sessionEl: Element) => {
  const session: Session = {};
  session.name = sessionEl.id.replace('tabs-', '');
  const campus = sessionEl.querySelector('.listTitle').textContent.replace('Summary - ', '').split(' ')[0];

  if (campus === 'Vancouver') {
    session.campus = Campus.UBCV;
  } else if (campus === 'Okanagan') {
    session.campus = Campus.UBCO;
  } else {
    session.campus = Campus.UNKNOWN;
  }

  const programInfoRows = sessionEl.querySelector('tbody > tr:nth-child(2) tbody').children;
  for (let row = 0; row < programInfoRows.length; row++) {
    const key = programInfoRows[row]?.children[0]?.textContent?.trim();
    const camelCaseKey = toCamelCase(key);
    const value = programInfoRows[row]?.children[1]?.textContent?.trim();
    session[camelCaseKey as SessionValues] = value;
  }

  if (session.program === 'UNCL') {
    session.program = 'Unclassified';
  }

  return session;
};

const parseCourse = async (courseRowEl: Element, session: Session) => {
  const course: Course = {};
  for (let col = 0; col < courseRowEl.children.length; col++) {
    if (col in CourseColumn) {
      // title is not in courseRow; instead get from storage (or fetch if not in storage)
      if (col === CourseColumn.TITLE) {
        const courseTitle = await getCourseTitle(course[CourseColumn.NAME], session) || '---';
        // escape latex special characters
        course[CourseColumn.TITLE] = courseTitle?.replace(/([&%$#_{}~^])/g, '\\$1');
      } else {
        // otherwise parse value from courseRowEl[col]
        let value = courseRowEl.children[col].textContent.trim();
        if (col === CourseColumn.TERM && value === '') {
          value = '1-2';
        }
        if (col === CourseColumn.NAME) {
          value = value.replace(NBSP, ' ');
        }
        course[col as CourseColumn] = value;
      }
    }
  }
  return course;
};
