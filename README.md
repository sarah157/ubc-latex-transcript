# UBC LaTeX Transcript Chrome Extension

Add to Chrome [here.](https://chromewebstore.google.com/detail/ubc-latex-transcript/kfkhdllleecjpgamiadfdeffgjmljhkp)

### Description
Transform your UBC Grades Summary into a LaTeX transcript using this Chrome extension! 

Currently, the unofficial transcript at UBC is a poorly formatted printout of the student Grades Summary page. While other solutions exist for improving the appearance of the Grades Summary page, this extension provides a transcript that looks professional and resembles the official version.

The resulting transcript is loaded into Overleaf, a popular online LaTeX editor, using the [Overleaf API](www.overleaf.com/devs). From there, it can be downloaded as a PDF or customized further by editing elements such as the table column names and line/table spacing.

### How to use this extension
1. Sign up for a free [Overleaf](https://www.overleaf.com/) account if you don't have one already.
2. Navigate to [Your Grades Summary](https://ssc.adm.ubc.ca/sscportal/servlets/SSCMain.jsp?function=SessGradeRpt) in the Student Service Centre.
3. Click on the extension and adjust any options (e.g., title, layout, filter W & Cr/D/F courses).
4. Click on `Generate Transcript`.
4. Click on `View Transcript in Overleaf` to load your transcript into Overleaf.

### How it works
1. A LaTeX transcript is generated using the information from the 'Your Grades Summary' page.
   - Most course titles are found in [`./public/data`](https://github.com/sarah157/ubc-latex-transcript/tree/main/public/data), which was created from [ubc-pair-grade-data](https://github.com/DonneyF/ubc-pair-grade-data). Otherwise, the [UBCGrades API](https://ubcgrades.com/api-reference) is used.
3. When the `View Transcript in Overleaf` button is clicked, an HTML form POST request containing your Base64-encoded transcript is sent to the Overleaf API:
   ```html
   <form action="https://www.overleaf.com/docs" method="POST" target="_blank">
      <input type="hidden" name="snip_uri[]" value="data:application/x-tex;base64,[your_base64_encoded_transcript]">      
      <input type="hidden" name="snip_uri[]" value="[url_to_ubc_logo_png]">
      <input type="hidden" name="snip_name" value="transcript.tex">
      <input type="hidden" name="snip_name" value="ubc-logo.png">
      <button type="submit">View Transcript in Overleaf</button>
   </form>
   ```

### How to run locally
1. Clone the repo
2. Run `npm install`
2. Run `npm run start` for development mode or `npm run build` for production build
3. Go to `chrome://extensions/` and click on `Load unpacked`
   - make sure `Developer mode` is switched on
4. Load the `dist` folder

### Images
**Extension popup with default options**

![Extension popup_with default_options](https://github.com/sarah157/ubc-latex-transcript/assets/47197893/59f1669e-6f51-4ba4-bc94-808f17e93304)


**Transcript generated using default options**

![Grades summary before and after with default options](https://github.com/sarah157/ubc-latex-transcript/assets/47197893/2b7e260f-311e-4b1e-ba3c-6dc49331767a)
