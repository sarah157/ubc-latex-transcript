import { FormField } from './model';

chrome.runtime.onInstalled.addListener(async () => {
  const defaultOptions = {
    [FormField.Title]: 'Grades Summary',
    [FormField.GroupBySession]: true,
    [FormField.BordersAroundTables]: false,
    [FormField.BordersBetweenRows]: false,
    [FormField.DropWCourses]: false,
    [FormField.DropCdfCourses]: false,
    [FormField.DropEmptyStdgCol]: false,
  };
  await chrome.storage.sync.set(defaultOptions);
});
