import { Course, CourseColumn, Session, Student, Options, Campus, TAB } from './types';

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
  tex.push('%%%%%%%%%%%%%%%%% TRANSCRIPT BODY %%%%%%%%%%%%%%%%%');
  tex.push('\\begin{document}\n');

  if (options.groupBySession) {
    // create table for each session
    for (let i = 0; i < sessions.length; i++) {
      tex.push(sessionTableTex(sessions[i], allCourses[i], dropStdg, options.bordersBetweenRows)
        + (i !== sessions.length - 1 ? '\n\\tableSpacing\n' : '\n'));
    }
  } else {
    // else create one table for all courses
    tex.push(allSessionsTableTex(sessions, allCourses, dropStdg, options.bordersBetweenRows));
  }

  // add document closing
  tex.push('% End of Record');
  tex.push('\\begin{center}*********************************** End of Record ***********************************\\end{center}\n');
  tex.push('\\end{document}');

  return tex.join('\n');
};

const docSetupAndHeaderTex = (
  student: Student,
  options: Options,
  dropStdg: boolean,
) => {
  let colSep = '0pt';
  if (options.groupBySession) colSep = options.bordersAroundTables ? '5pt' : '3pt';
  return `\\documentclass[10pt]{article}
\\usepackage{fancyhdr, graphicx, longtable, lastpage}
\\usepackage[empty]{fullpage}
\\usepackage[table]{xcolor}
\\usepackage[none]{hyphenat}
\\usepackage{times} % Font - Remove for default. For more fonts see: https://www.overleaf.com/learn/latex/Font_typefaces
\\usepackage[
includehead, 
margin=0.5in, % page margins,
headsep=${options.groupBySession ? '1' : '0.5'}cm, % spacing between transcript header and body,
headheight=2.5cm % header height
]{geometry}

% Setup
\\pagestyle{fancy}
\\fancyhf{}
\\setlength{\\footskip}{12pt}
\\setlength\\LTleft{0pt}
\\setlength\\LTright{0pt}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\setlength{\\tabcolsep}{${colSep}}
\\renewcommand{\\arraystretch}{${options.groupBySession ? '1.4' : '1.6'}} % line/row spacing - default 1
\\arrayrulecolor{gray!70} % border color

%%%%%%%%%%%%%%%%% DEFINITIONS %%%%%%%%%%%%%%%%%
% Student info
\\def\\studentName{${student.name}}
\\def\\studentNumber{${student.number}}

% Title
\\newcommand{\\transcriptTitle}{\\textbf{\\LARGE{${options.title}}}}

% Spacing between tables
\\newcommand{\\tableSpacing}{\\vspace{-0.25cm}}

${tableDefinitionsTex(options, dropStdg)}

%%%%%%%%%%%%%%%%% TRANSCRIPT HEADER %%%%%%%%%%%%%%%%%
\\fancyhead[C]{
% Title
\\parbox{8cm}{\\centering \\transcriptTitle}\\\\

% UBC logo
\\def\\logoHeight{1.2cm}
\\vspace{-\\logoHeight}
\\begin{flushleft}
    \\includegraphics[height=\\logoHeight]{ubc-logo.png} 
\\end{flushleft}

% Name, student number, date printed, page number
\\renewcommand{\\arraystretch}{1}
\\begin{tabular*}{\\textwidth}[t]{@{} *{2}{l @{\\hspace{1cm}}} l @{\\extracolsep{\\fill}} l @{}}
    \\textbf{Full Name:} & \\textbf{Student Number:} & \\textbf{Date Printed:} & \\textbf{{Page: \\thepage\\ of \\pageref{LastPage}}} \\\\
    \\studentName & \\studentNumber & \\today \\\\
\\end{tabular*}}\n`;
};

const tableDefinitionsTex = (options: Options, dropStdg: boolean) => {
  const pipe = options.bordersAroundTables ? '|' : '';
  const hline = options.bordersAroundTables ? '\\hline' : '';
  const hlineRow = options.bordersBetweenRows ? '\\hline' : '';
  let n = options.groupBySession ? 9 : 12;
  if (dropStdg) n--;

  const tableBegin = 
    options.groupBySession 
      // use @{\extracolsep{\fill}} at beginning to make longtable fit page width. ref: https://tex.stackexchange.com/a/110274
      // @{\extracolsep{\fill}} removes padding at beginning; @{\hspace{\tabcolsep}} readds padding
      ? `\\begin{longtable}{@{\\extracolsep{\\fill}} ${pipe}@{\\hspace{\\tabcolsep}} l L{2cm} L{${dropStdg ? '8.5' : '7.5'}cm} r l${dropStdg ? '' : ' l'} r r r${pipe}}`
      : `\\begin{longtable}{@{\\extracolsep{\\fill}}${pipe && ' |@{\\hspace{6pt}}'} l L{${dropStdg ? '7' : '6.5'}cm} r l l l l c${dropStdg ? '' : ' c'} r r r${pipe && '@{\\hspace{6pt}}|'}}`;
  
  const tableFooter = 
    options.bordersBetweenRows
      ? `% Table Footer\n${TAB}\\hline\\endlastfoot`
      : options.bordersAroundTables ? `% Table Footer\n${TAB}\\hline\\endfoot` : '';

  const extraColsForSessionInfo = 
    !options.groupBySession
      ? '\\textbf{Session} & \\textbf{Term} & \\textbf{Prgm} & \\textbf{Yr} &'
      : '';

  const sessionTable = `% Session table environment; args: Session, Program, Campus, Year
\\newenvironment{Table}[4]
{${tableBegin}
    % Table header
    ${(hline || hlineRow)}\\TableHeading{#1}
    \\multicolumn{${n}}{${pipe}l${pipe}}{\\textbf{#2} (#3) \\textbf{- Year #4}} \\\\[-1.5ex]
    \\TableColumnNames${hlineRow}
    \\endfirsthead
    % Table header if table continues onto next page
    ${(hline || hlineRow)}\\TableHeading{#1 continued \\dots}
    \\TableColumnNames
    \\endhead
    ${tableFooter}}
{\\end{longtable}}`;

  const allSessionsTable = `% Table environment
\\newenvironment{Table}
{${tableBegin}
    % Table Header
    ${(hline || hlineRow)}\\TableColumnNames${hlineRow} \\endhead
    ${tableFooter}}
{\\end{longtable}}`;

  return `% Table column names
\\newcommand{\\TableColumnNames}{
\\multicolumn{${n - 2}}{${pipe}c}{} & \\multicolumn{2}{c${pipe}}{\\textbf{Class}} \\\\[-1.25ex]
${options.groupBySession ? '\\textbf{Term} &' : ''} \\textbf{Course} & \\textbf{Course Title} & \\textbf{Grade} & \\textbf{Letter} & ${extraColsForSessionInfo} ${dropStdg ? '' : '\\textbf{Stdg} &'} \\textbf{Credits} & \\textbf{~Avg} & \\textbf{Size}\\\\}

% Table heading
\\newcommand{\\TableHeading}[1]{\\multicolumn{${n}}{${pipe}l${pipe}}{\\cellcolor{gray!20}\\fontsize{11}{12}\\selectfont{\\textbf{#1}}}\\\\}

\\newcolumntype{R}[1]{>{\\raggedleft\\arraybackslash}p{#1}}
\\newcolumntype{L}[1]{>{\\raggedright\\arraybackslash}p{#1}}

${options.groupBySession ? sessionTable : allSessionsTable}`;
};

const sessionTableTex = (
  session: Session,
  courses: Course[],
  dropStdg: boolean,
  rowBorders: boolean,
) => {
  const table = [];
  table.push(`\\begin{Table}{${sessionFullName(session.name)}}{${session.program}}{${campusFullName(session.campus)}}{${session.yearLevel}}`);

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const courseTex = [];
    courseTex.push(`{${course[CourseColumn.TERM]}}`);
    courseTex.push(`{${course[CourseColumn.NAME]}}`);
    courseTex.push(`{${course[CourseColumn.TITLE]}}`);
    courseTex.push(`{${course[CourseColumn.PCT_GRADE]}}`);
    courseTex.push(`{${course[CourseColumn.LETTER_GRADE]}}`);
    if (!dropStdg) courseTex.push(`{${course[CourseColumn.STANDING]}}`);
    courseTex.push(`{${course[CourseColumn.CREDITS]}}`);
    courseTex.push(`{${course[CourseColumn.CLASS_AVG]}}`);
    courseTex.push(`{${course[CourseColumn.CLASS_SIZE]}}`);
    const border = rowBorders && i !== courses.length - 1 ? '\\hline' : '';
    table.push([TAB] + courseTex.join(' & ') + '\\\\' + border);
  }

  table.push('\\end{Table}');
  return table.join('\n');
};

const allSessionsTableTex = (
  sessions: Session[],
  allCourses: Course[][],
  dropStdg: boolean,
  rowBorders: boolean,
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
      return crs2[CourseColumn.TERM].localeCompare(crs1[CourseColumn.TERM]);
    });
    for (let j = 0; j < orderedCourses.length; j++) {
      const course = orderedCourses[j];
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
      const border =
        rowBorders && !(j === orderedCourses.length - 1 && i === sessions.length - 1)
          ? '\\hline'
          : '';
      table.push([TAB] + courseTex.join(' & ') + '\\\\' + border);
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

const campusFullName = (campus: string) => {
  if (campus === Campus.UBCV) {
    return 'UBC Vancouver';
  } else if (campus === Campus.UBCO) {
    return 'UBC Okanagan';
  } else {
    return "UBC";
  }
};
