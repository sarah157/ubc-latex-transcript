# Course Title Data

To minimize reliance on external APIs and dependencies, this folder contains JSON data that map course subject codes to their course title(s) for both UBCV and UBCO. While for most cases the title can be extracted from these files, the [UBCGrades API](https://ubcgrades.com/api-reference) serves as a fallback.

### Data Source and Scope

The JSON data is derived from [ubc-pair-grade-data](https://github.com/DonneyF/ubc-pair-grade-data) and contains courses offered in 2014 or later. This includes all courses in Tableau dashboard versions 1 and 2, as well as courses in PAIR reports from 2014 onward. 

Course titles exclusively found in PAIR reports (e.g., some co-ops, seminars, dissertations) follow the old title format, which is capitalized and abbreviated. In the JSON data, most of these titles have been replaced with their complete forms, which was scraped from `https://vancouver.calendar.ubc.ca/course-descriptions/subject/${subj}` (e.g., `subj = 'biol'`).

### Structure of JSON Data

The course subject code is mapped to either a string or, in cases where the title is session-dependent, to a list of `[session, title]` tuples. These tuples are ordered by session in descending order, with the last session indicating the first offering of the course. For example:

```json
"FUN-101": [
    ["2020W", "Title A"],
    ["2011W", "Title B"] 
]
```
In this case, if `session >= 2020W`, the title is "Title A", and if `session >= 2011W (and < 2020W)`, the title is "Title B". This structure is valid since course titles do not revert to titles from previous sessions.
