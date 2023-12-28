# UBC LaTeX Transcript Chrome Extension

### Description
Transform your UBC Grades Summary into a LaTeX transcript using this Chrome extension! 

Currently, UBC lacks an unofficial transcript, leaving students with a poorly formatted view of their Grades Summary page. While other solutions exist for improving the appearance of the Grades Summary page, this extension provides a transcript that looks professional and resembles the official version.

The resulting transcript is loaded into Overleaf, a popular online LaTeX editor, using the Overleaf API (www.overleaf.com/devs). From there, it can be downloaded as a PDF or customized further by editing elements such as the table column names and line/table spacing.

### How to use this extension
1. Sign up for a free [Overleaf](https://www.overleaf.com/) account if you don't have one already.
2. Navigate to [Your Grades Summary](https://ssc.adm.ubc.ca/sscportal/servlets/SSCMain.jsp?function=SessGradeRpt) in the Student Service Centre.
3. Click on the extension and adjust any options.
4. Click on 'Generate Transcript.'
4. Click on 'View Transcript in Overleaf' to load your transcript into Overleaf.

### How it works
1. A LaTeX transcript is generated using the information from 'Your Grades Summary'.
   - The course title is found in [`./public/data`](https://github.com/sarah157/ubc-latex-transcript/tree/main/public/data), which was created from [ubc-pair-grade-data](https://github.com/DonneyF/ubc-pair-grade-data/tree/master/tableau-dashboard-v2)
3. When the 'View Transcript in Overleaf' button is clicked, an HTML form POST request containing your Base64-encoded transcript is sent to the [Overleaf API](https://www.overleaf.com/devs):
   ```html
   <form action="https://www.overleaf.com/docs" method="POST" target="_blank">
      <input type="hidden" name="snip_uri[]" value="data:application/x-tex;base64,[your_base64_encoded_transcript]">      
      <input type="hidden" name="snip_uri[]" value="<url_to_ubc_logo_png>">
      <input type="hidden" name="snip_name" value="transcript.tex">
      <input type="hidden" name="snip_name" value="ubc-logo.png">
      <button type="submit" id="button">View Transcript in Overleaf</button>
   </form>
   ```

### Images
**Extension popup with default options**

![Extension popup_with default_options](https://github.com/sarah157/ubc-latex-transcript/assets/47197893/4f7aaa45-c6d8-4c43-abd9-a10d65f9bd31)


**Transcript generated using default options**

![Grades summary before and after with default options](https://github.com/sarah157/ubc-latex-transcript/assets/47197893/83316a94-55b5-42d1-90cf-7ec9a14b0fea)
