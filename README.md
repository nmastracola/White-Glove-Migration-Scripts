# Canvas-Phrase-Checker

Canvas Phrase Checker will search the object that you choose (Content Pages, Discussions, Assignments, Quizzes) for a specific phrase and give you a report on where that phrase was found.

*A Couple Things to Note*

1.  This Script uses Node.js in order to run.  You must first install Node on your computer as well as install the NPM packages inside the root directory of the script. (`npm install`)

2.  You must place your Canvas Token inside the quotation marks on the config.js file.

3. In order to start the script you must be in the root of the directory of the script and run (`node index.js`)

3. After running the script, if any matches were found, a CSV will be generated in the "Logs" folder.  If you ran just a simple "Find" search, it will be nested under the "Find" folder.  If you ran a Find and Replace, it will be under the "Replace" folder.

4. The portion that searches for your phrase is case insensitive.  It will find all variations of the phrase, however the "Replace" feature has an option for both sensitive and insensitive.  