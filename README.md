# Find And Replace

Canvas Find And Replace will search the object that you choose (Content Pages, Discussions, Assignments) for a specific phrase or and give you a report on where it was found. You also have the option to replace that word or phrase with a new one.

*A Couple Things to Note*

1.  This Script uses Node.js in order to run.  You must first install Node on your computer as well as install the NPM packages inside the root directory of the script. (`npm install`)

2.  You must place your Canvas Token inside the quotation marks on the config.js file.

3. In order to start the script you must be in the root of the directory of the script and run (`node index.js`)

3. After running the script, if any matches were found, a CSV will be generated in the "Logs" folder.  If you ran just a simple "Find" search, it will be nested under the "Find" folder.  If you ran a Find and Replace, it will be under the "Replace" folder.

4. The portion that searches for your phrase is case insensitive.  It will find all variations of the phrase, however the "Replace" feature has an option for both sensitive and insensitive.  


# Header Footer

The Header Footer script will allow you to add a header and a footer image to all of your content pages.  You will first need to upload the headers and the footers into your canvas course, as you will need the file API Number that is associated to them.  It is important to note that the header and footer script does not add these images to any assignments, discussions or quizzes.


# Pages Roll Back

This script was introduced for that "Just in Case" scenario where you upload the wrong header or footer with the script above.  This allows you to revert all pages back to the version previous to running the script.


# Wiley Script

This is a custom script for a school that wanted to add ' - Assessment' to the end of all their assignments.  This script will allow you to do that and set a specific point value for all of them.


