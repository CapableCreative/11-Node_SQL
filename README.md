# Homework 12: Node_SQL
Student: <b>Stephen Fox</b>
Trilogy Education / Vanderbilt FSF Bootcamp — July 2019 Cohort

----------------
<h4>I. The Problem</h4>
Data is at the center of every interaction between a customer (user) and a company (provider of good or service). We need to create a rudimentary application capable of allowing those standard transations to update the database. We're looking to allow:
<ul>
    <li>A company to:
        <ul>
            <li>Create an item (POST, within the app)</li>
            <li>Observe depletion of purchased items</li>
            <li>Restock depleted items</li>
        </ul>
    <li>A customer to:
        <ul>
            <li>View available items</li>
            <li>Bid on / purchase items</li>
            <li>Recieve feedback if an item is sold out</li>
        </ul>
    </li>
</ul>

<div style="background: #eaeaea; padding: 5px 20px; margin: 0px 0px 0px 0px;">
<h4>II. The Purpose</h4>
Data is at the center of every interaction between a customer (user) and a company (provider of good or service). We need to create a rudimentary application capable of allowing those standard transations to update the database. We're looking to allow:
<ul>
    <li>Demonstrate an understanding of:
    <ol>
        <li><b>Node</b> - as a js runtime capable of CRUD database manipulations</li>
        <li><b>SQL</b> - as a standard for database interactions</li>
        <li><b>NPM</b> - as a package manager for node</li>
        <li><b>NPM MySQL</b> - as a Node package capable of delivering SQL commands based on contextualized user input</li>
        <li><b>Inquirer</b> - as a Node package capable of prompting users to provide input</li>
    </ol>
    <li>Execute consistency and quality while:
    <ol>
        <li><b>Maintaining the repo</b> - creating a verifiable record of commits and commit messages</li>
        <li><b>README.md</b> - documenting the purpose, approach, and outcome of  the project in a clear, easy to understand manner</li>
        <li><b>Comments</b> - authoring strategic comments throughout code to allow easy application maintenance and understanding</li>
    </ol>
</div>

-------------
<h4>III. Approach</h4>
<b>I began with the GreatBay class activity</b> from a few weeks ago. Since I'm a bit behind, I leveraged quite a bit of the base of that code to inform my approach with this project. This included:<br>

* Using INQUIRER npm to gather user input via prompts
* Using MySQL npm to interact with a local database

Once I understood the methodology within that application, I rewrote all the functions to allow depletion of stock from a new QUANTITY column within the table. I created a new RESTOCK option, as well as depricating the QUANTITY of items as they were purchased.

While I referenced GreatBay.js, I ultimately rewrote everything to ensure I understood syntax and the methodology of the two npms used. Specific notes on my thought process are within the .js file.

-------------

<div style="background: #eaeaea; padding: 5px 20px; margin: 0px 0px 0px 0px;">
<h4>IV. Useful Project Links</h4>

<b>Github Repo:</b> https://github.com/CapableCreative/11-Node_SQL
</div>
