export enum FormField {
  Title = 'title',
  GroupBySession = 'groupBySession',
  BordersAroundTables = 'bordersAroundTables',
  BordersBetweenRows = 'bordersBetweenRows',
  DropWCourses = 'dropWCourses',
  DropCdfCourses = 'dropCdfCourses',
  DropEmptyStdgCol = 'dropEmptyStdgCol',
}

export enum ButtonType {
  DEFAULT = 'button',
  SUBMIT = 'submit',
}

export enum ButtonText {
  DEFAULT = 'Generate Transcript',
  SUBMIT = 'View Transcript in Overleaf',
}

export interface Options {
  [FormField.Title]?: string;
  [FormField.GroupBySession]?: boolean;
  [FormField.BordersAroundTables]?: boolean;
  [FormField.BordersBetweenRows]?: boolean;
  [FormField.DropWCourses]?: boolean;
  [FormField.DropCdfCourses]?: boolean;
  [FormField.DropEmptyStdgCol]?: boolean;
}

export interface InputEvent extends Event {
  target: HTMLInputElement;
}

// constants
export const GRADES_SUMMARY_URL =
  'https://ssc.adm.ubc.ca/sscportal/servlets/SSCMain.jsp?function=SessGradeRpt';

export const INVALID_URL_HTML = `<p>To use this extension, go to 
  <a href="${GRADES_SUMMARY_URL}" target="_blank"><b>Your Grades Summary</b></a> 
  in the Student Service Centre (SSC).</p>`;

export const DEFAULT_OPTIONS: Options = {
  [FormField.Title]: 'Grades Summary',
  [FormField.GroupBySession]: false,
  [FormField.BordersAroundTables]: false,
  [FormField.BordersBetweenRows]: false,
  [FormField.DropWCourses]: false,
  [FormField.DropCdfCourses]: false,
  [FormField.DropEmptyStdgCol]: false,
};
