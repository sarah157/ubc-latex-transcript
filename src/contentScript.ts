import { getCourseName, toCamelCase } from './helpers';
import { buildTex } from './buildTex';
import {
  Session,
  SessionValues,
  Course,
  CourseColumn,
  Student,
  Options,
} from './types';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == 'GENERATE_TRANSCRIPT') {
    generateTranscriptZip(request.options).then((data) => sendResponse({ data }));
  }
  return true;
});

const generateTranscriptZip = async (options: Options) => {
  const { student, sessions, allCourses, isStdgColEmpty } = await parseDataFromDOM(options);
  const latexTranscript = buildTex(student, sessions, allCourses, options, isStdgColEmpty);
  // return base64-encoded transcript
  return btoa(latexTranscript);
};

const parseDataFromDOM = async (options: Options) => {
  const student: Student = {};
  const sessions: Session[] = [];
  const allCourses: Course[][] = [];

  // parse student info
  const studentEl: Element = document.querySelector('#ubc7-unit-name > span.pull-right',);
  student.name = studentEl?.textContent.split('\n')[2].trim().split('Name: ')[1];
  student.number = studentEl?.textContent.split('\n')[3].trim().split('Student #: ')[1];

  // used to determine if standing col should be dropped if it is empty
  let stdgColCount = 0;

  // iterate through all session tabs; start at i = 2 to skip tabs-list and tabs-all
  const iframe: HTMLIFrameElement = document.querySelector('#iframe-main');
  const sessionTabsColl: HTMLCollection = iframe.contentWindow.document.querySelector('#tabs').children;
  for (let i = 2; i < sessionTabsColl.length; i++) {
    const session = parseSession(sessionTabsColl[i]);
    sessions.push(session);

    // iterate through current session's courses
    const sessionCoursesColl: HTMLCollection = sessionTabsColl[i].querySelector('tbody').children;
    const currCourses = [];
    for (let crs = 3; crs < sessionCoursesColl.length; crs++) {
      if (sessionCoursesColl[crs].className == 'listRow') {
        const course = await parseCourse(sessionCoursesColl[crs], session.campus);
        // if specified in options, drop CDF or W courses
        const courseStanding = course[CourseColumn.STANDING];
        if (courseStanding.length > 0) {
          if (options.dropWCourses && courseStanding[0] === 'W') continue;
          if (options.dropCdfCourses && ['C', 'D', 'F'].includes(courseStanding[0])) continue;
          stdgColCount++;
        }
        currCourses.push(course);
      }
    }
    allCourses.push(currCourses);
  }

  const isStdgColEmpty = stdgColCount === 0;
  return { student, sessions, allCourses, isStdgColEmpty };
};

const parseSession = (sessionEl: Element) => {
  const session: Session = {};
  session.name = sessionEl.id.replace('tabs-', '');
  session.campus = sessionEl.querySelector('.listTitle').textContent.replace('Summary - ', '').split(' ')[0];

  const programInfoRows = sessionEl.querySelector('tbody > tr:nth-child(2) tbody').children;
  for (let row = 0; row < programInfoRows.length; row++) {
    const key = programInfoRows[row].children[0].textContent.trim();
    const camelCaseKey = toCamelCase(key);
    const value = programInfoRows[row].children[1].textContent.trim();
    session[camelCaseKey as SessionValues] = value;
  }

  if (session.program === 'UNCL') {
    session.program = 'Unclassified';
  }

  return session;
};

// non-breaking space is used to split Course name into subject and code (e.g., MATH&nbsp200)
const NBSP = ' ';

const parseCourse = async (courseRowEl: Element, campus: string) => {
  const course: Course = {};
  for (let col = 0; col < courseRowEl.children.length; col++) {
    if (col in CourseColumn) {
      let value = courseRowEl.children[col].textContent.trim();
      // title is not in courseRow; instead get from storage (or fetch if not in storage)
      if (col === CourseColumn.TITLE) {
        const courseTitle = await getCourseName(course[CourseColumn.NAME], campus);
        // escape latex special characters
        course[CourseColumn.TITLE] = courseTitle?.replace(/([&%$#_{}~^])/g, '\\$1') || '---';
      } else {
        // otherwise parse value from courseRowEl[col]
        if (col === CourseColumn.TERM && value == '') {
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
