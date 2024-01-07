import { Course, CourseColumn, Session, Student, Options } from './types';

export const buildTex = (
  student: Student,
  sessions: Session[],
  allCourses: Course[][],
  options: Options,
  isStdgColEmpty: boolean,
) => {
  const tex = [];
  const dropStdg = options.dropEmptyStdgCol && isStdgColEmpty;
  tex.push(docSetupAndHeaderTex(student, options, dropStdg));
  
  // add document beginning
  tex.push('%%%%%%%%%%%%%%% TRANSCRIPT MAIN %%%%%%%%%%%%%%%');
  tex.push('\\begin{document}\n');
  
  // add border between course rows if specified in options
  const hlineRow = options.bordersBetweenRows ? '\\hline' : '';

  if (options.groupBySession) {
    // create table for each session
    for (let i = 0; i < sessions.length; i++) {
      tex.push(sessionTableTex(sessions[i], allCourses[i], dropStdg));
    }
  } else {
    // else create one table for all courses
    tex.push(allSessionsTableTex(sessions, allCourses, dropStdg, hlineRow));
  }

  // add document closing
  tex.push('% End of Record');
  tex.push('\\begin{center}*********************************** End of Record ***********************************\\end{center}');
  tex.push('\\end{document}');

  return tex.join('\n');
};

const docSetupAndHeaderTex = (
  student: Student,
  options: Options,
  dropStdg: boolean,
) => {
  return `\\documentclass{article}
\\usepackage[empty]{fullpage}
\\usepackage[table]{xcolor}
\\usepackage[includeheadfoot, margin=0.5in,headheight=3cm]{geometry}
\\usepackage{fancyhdr, graphicx, longtable, lastpage}
\\usepackage{times} % Font - Remove for default. For more fonts see: https://www.overleaf.com/learn/latex/Font_typefaces

% Setup
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\renewcommand{\\arraystretch}{${options.groupBySession ? '1.4' : '1.6'}} % Line/row spacing - default 1
${!options.groupBySession ? '\\setlength{\\tabcolsep}{4pt} % Column spacing' : ''}

%%%%%%%%%%%%%%% DEFINITIONS %%%%%%%%%%%%%%%
% Student info
\\def\\studentName{${student.name}}
\\def\\studentNumber{${student.number}}

% Title
\\newcommand{\\transcriptTitle}{\\textbf{\\LARGE{${options.title}}}}

% Spacing between tables
\\newcommand{\\tableSpacing}{\\vspace{-1em}}

${tableDefinitionsTex(options, dropStdg)}

%%%%%%%%%%%%%%% TRANSCRIPT HEADER %%%%%%%%%%%%%%%
% UBC logo
\\lhead{\\hspace{0.6em\\vspace{-2em}}\\includegraphics[height=1.2cm]{ubc-logo.png}}
\\rhead{\\begin{tabular*}{\\textwidth}[t]{l l l@{\\extracolsep{\\fill}}l}
% Title
\\multicolumn{4}{c}{\\parbox[c]{7cm}{\\centering{\\transcriptTitle}}} \\\\[2em]
% Name, student number, date printed, page number
\\textbf{Full Name:} & \\textbf{Student Number:} & \\textbf{Date Printed:} & \\textbf{{Page: \\thepage\\ of \\pageref{LastPage}}} \\\\[-0.2em]
\\studentName & \\studentNumber & {\\today} \\\\[2em]
\\end{tabular*}}\n`;
};

const TAB = '    ';

const sessionTableTex = (
  session: Session,
  courses: Course[],
  dropStdg: boolean,
) => {
  const table = [];
  table.push(`\\begin{Table}{${sessionFullName(session.name)}}{${session.program}}{${session.campus}}{${session.yearLevel}}`);

  for (const course of courses) {
    const courseTex = [`${TAB}\\Course`];
    courseTex.push(`{${course[CourseColumn.TERM]}}`);
    courseTex.push(`{${course[CourseColumn.NAME]}}`);
    courseTex.push(`{${course[CourseColumn.TITLE]}}`);
    courseTex.push(`{${course[CourseColumn.PCT_GRADE]}}`);
    courseTex.push(`{${course[CourseColumn.LETTER_GRADE]}}`);
    courseTex.push(dropStdg ? '' : `{${course[CourseColumn.STANDING]}}`);
    courseTex.push(`{${course[CourseColumn.CREDITS]}}`);
    courseTex.push(`{${course[CourseColumn.CLASS_AVG]}}`);
    courseTex.push(`{${course[CourseColumn.CLASS_SIZE]}}`);
    table.push(courseTex.join(''));
  }

  table.push('\\end{Table}\n');
  return table.join('\n');
};

const allSessionsTableTex = (
  sessions: Session[],
  allCourses: Course[][],
  dropStdg: boolean,
  hlineRow: string,
) => {
  const table = [];
  table.push(`\\begin{Table}`);

  for (let i = 0; i < sessions.length; i++) {
    // order courses as seen in SSC All Sessions tab
    // order by term (desc) then by course name (desc)
    const orderedCourses = allCourses[i].sort((crs1, crs2) => {
      if (crs1[CourseColumn.TERM] === crs2[CourseColumn.TERM]) {
        return crs2[CourseColumn.NAME].localeCompare(crs1[CourseColumn.NAME]);
      }
      return crs2[CourseColumn.TERM].localeCompare(crs1[CourseColumn.TERM])
    })
    for (const course of orderedCourses) {
      const courseTex = [];
      courseTex.push(`{${course[CourseColumn.NAME]}}`);
      courseTex.push(`{${course[CourseColumn.TITLE]}}`);
      courseTex.push(`{${course[CourseColumn.PCT_GRADE]}}`);
      courseTex.push(`{${course[CourseColumn.LETTER_GRADE]}}`);
      courseTex.push(`{${sessions[i].name}}`);
      courseTex.push(`{${course[CourseColumn.TERM]}}`);
      courseTex.push(`{${sessions[i].program}}`);
      courseTex.push(`{${sessions[i].yearLevel}}`);
      if (!dropStdg) courseTex.push(`{${course[CourseColumn.STANDING]}}`);
      courseTex.push(`{${course[CourseColumn.CREDITS]}}`);
      courseTex.push(`{${course[CourseColumn.CLASS_AVG]}}`);
      courseTex.push(`{${course[CourseColumn.CLASS_SIZE]}}`);
      table.push([TAB] + courseTex.join(' & ') + [` \\\\${hlineRow}`]);
    }
  }

  table.push('\\end{Table}\n');
  return table.join('\n');
};

const sessionFullName = (sessionName: string) => {
  const year = sessionName.substring(0, 4);
  const season = sessionName.substring(4);
  if (season === 'S') {
    return `Summer Session ${year}`;
  } else {
    return `Winter Session ${year} - ${Number(year) + 1}`;
  }
};

const tableDefinitionsTex = (options: Options, dropStdg: boolean) => {
  const pipe = options.bordersAroundTables ? '|' : '';
  const hline = options.bordersAroundTables ? '\\hline' : '';
  const hlineRow = options.bordersBetweenRows ? '\\hline' : '';
  let n = options.groupBySession ? 9 : 12;
  if (dropStdg) n--;

  const tableBegin = 
    options.groupBySession 
      ? `\\begin{longtable}{${pipe}l l p{${dropStdg ? '8' : '7'}cm}@{\\extracolsep{\\fill}} r l ${dropStdg ? '' : 'l'} r r r${pipe}}`
      : `\\begin{longtable}{${pipe}l p{${dropStdg ? '7' : '6'}cm}@{\\extracolsep{\\fill}} r l l l l l ${dropStdg ? '' : 'l'} r r r${pipe}}`;

  const tableFooter = 
    options.bordersAroundTables && !options.bordersBetweenRows
      ? `% Table Footer\n${TAB}\\hline\\endfoot`
      : '';

  const extraColsForSessionInfo = 
    !options.groupBySession
      ? '\\textbf{Session} & \\textbf{Term} & \\textbf{Prgm} & \\textbf{Yr} &'
      : '';

  const sessionTable = `% Session table environment; args: Session, Program, Campus, Year
\\newenvironment{Table}[4]
{${tableBegin}
    % Table header
    \\TableHeading{#1}
    \\multicolumn{${n}}{${pipe}l${pipe}}{\\textbf{#2} (UBC #3) \\textbf{- Year #4}} \\\\[-0.75em]
    \\TableColumnNames${hlineRow}
    \\endfirsthead
    % Table header if table continues onto next page
    \\TableHeading{#1 continued \\dots}
    \\TableColumnNames
    \\endhead
    ${tableFooter}}
{\\end{longtable} \\tableSpacing}`;

  const allSessionsTable = `% Table environment
\\newenvironment{Table}
{${tableBegin}
    % Table Header
    ${hline}\\TableColumnNames${hlineRow} \\endhead
    ${tableFooter}}
{\\end{longtable} \\tableSpacing}`;

  return `% Table column names
\\newcommand{\\TableColumnNames}{
\\multicolumn{${n - 2}}{${pipe}c}{} & \\multicolumn{2}{c${pipe}}{\\textbf{Class}} \\\\[-0.5em]
${options.groupBySession ? '\\textbf{Term} &' : ''} \\textbf{Course} & \\textbf{Course Title} & \\textbf{Grade} & \\textbf{Letter} & ${extraColsForSessionInfo} ${dropStdg ? '' : '\\textbf{Stdg} &'} \\textbf{Credits} & \\textbf{Avg} & \\textbf{Size}\\\\}

% Table heading
\\newcommand{\\TableHeading}[1]{${hline}\\multicolumn{${n}}{${pipe}l${pipe}}{\\cellcolor{gray!25}\\large{\\textbf{#1}}}\\\\}

${options.groupBySession 
  ? `% Table course row\n\\newcommand{\\Course}[${n}]{#1 & #2 & #3 & #4 & #5 & #6 & #7 & #8 ${dropStdg ? '' : '& #9'}\\\\ ${hlineRow}}\n`
  : ''}
${options.groupBySession ? sessionTable : allSessionsTable}`;
};