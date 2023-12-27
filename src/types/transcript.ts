// Follows column order in the Grades Summary page
export enum CourseColumn {
  TERM,
  NAME,
  TITLE,
  PCT_GRADE = 4,
  LETTER_GRADE,
  STANDING,
  CREDITS,
  CLASS_AVG,
  CLASS_SIZE,
}

// Corresponds to the values (in camel case) in the session tabs in the Grades Summary page
export enum SessionValues {
  NAME = 'name',
  CAMPUS = 'campus',
  PROGRAM = 'program',
  YEAR_LEVEL = 'yearLevel',
  SPECIALIZATION = 'specialization',
  SESSIONAL_AVG = 'sessionalAverage',
  SESSIONAL_STDG = 'sessionalStanding',
}

export type Course = {
  [key in CourseColumn]?: string;
};

export type Session = {
  [key in SessionValues]?: string;
};

export type Student = {
  name?: string;
  number?: string;
};
