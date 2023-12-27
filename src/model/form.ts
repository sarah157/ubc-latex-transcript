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
