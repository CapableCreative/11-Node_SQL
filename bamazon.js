// Begin by requiring the specific npm packages below:
var mysql = require("mysql");
var inquirer = require("inquirer");

// Reference MySql npm documentation to understand the parameters needed to connect to your server. This application relies on a localhost server called "homework11_db"
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Bbatman778",
    database: "homework11_db"
});

// Use the npm built in functions to deliver error logging if a connection error occurs, otherwise, display port and instance of connection
connection.connect(function(err){
    if (err) throw err;
    console.log("Connected as id: " +connection.threadId);
    start();
});

// start() is the main function displaying the entry-point prompt via inquirer. From here, we simply create options to lead into our other options: Post an item, Bid on an item, Quit, or Restock an item
function start() {
    inquirer
        .prompt({
            name:"postOrBid",
            type:"list",
            message:"Would you like to [POST] a new item, or [BID] on an existing item?",
            choices:["POST","BID","QUIT","RESTOCK"]
        }).then(function(answer) {
        if(answer.postOrBid.toUpperCase()=== "POST") {
            postAuction();
        } else if (answer.postOrBid.toUpperCase()=== "BID") {
            bidAuction();
        } else if(answer.postOrBid.toUpperCase()=== "RESTOCK") {
            restockAuction();
        } else { 
            connection.end();
        }
    });
}

// if POST is selected from the start(), this function guides the user through several criteria necessary to create an item within the auctionItems table (within the homework11_db)
function postAuction() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "What is the name of the new item?"
            } , 
            {
                name: "category",
                type: "input",
                message: "What category would you like to place it in?"
            } , 
            {
                name: "quantity",
                type: "input",
                message: "How many units would you like to stock?"
            },
            {
                name: "startingBid",
                type: "input",
                message: "What would you like the starting bid to be? $",
                // Simple validation to prevent empty data submission for the starting Bid — I did not consistently implement this; this is something I saw in the initial GreatBay.js and added it here just to have it
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;    
                }
            }
        ])
        // Once selections have been made via the inquirer prompts, this function takes the answer key value pairs and uses them to rewrite SQL
        // "?" are used to allow various parameters to populate along with other SQL syntax elements
        .then(function(answer) {
            connection.query("INSERT INTO auctionItems SET ?", 
            {
                itemName: answer.item,
                category: answer.category,
                startingBid: answer.startingBid || 0,
                highestBid: answer.highestBid || 0,
                quantity: answer.quantity || 0
            },
            // If all successfully updated the database.table, this function runs to throw errors, or post success
            function(err) {
                if (err) throw err;
                console.log("Your new item has been posted for sale.");
                // Once the function is complete, we call the initial start() to exit this function.
                start();
            }
        );
    });
}

// if BID is selected from the start(), this function guides the user through several criteria necessary to bid on item within the auctionItems table (within the homework11_db)
function bidAuction(){
    // here we view all rows from the auctionItems table
    connection.query("SELECT * FROM auctionItems", function(err,results) {
        if (err) throw err;
        console.log(results);
        // This logic is very similar to the POST function, but requires querying the database before action is taken
        inquirer.prompt([{
            name: "choice",
            type: "rawlist",
            choices: function(){
                var choiceArray = [];
                // we use a for loop to display itemName values within that column; this represents items that can be BID on
                for (var i = 0; i < results.length; i++ ){
                    choiceArray.push(results[i].itemName);
                } 
                return choiceArray;
            },
            message: "Which item would you like to bid on?"
            },
            {
                name: "bid",
                type: "input",
                message: "How much would you like to bid?"
            }
            ]).then(function(answer){
                var chosenItem;
                for (var i = 0; i < results.length; i++){
                    if (results[i].itemName === answer.choice){
                    chosenItem = results[i];
                }
            }

            // Once a bid has been made, I created several variables for simpler reference within the logged items and interactions (It turns out I didn't need to parse several of them ... no harm though)
            let parsedHighestBid = parseInt(chosenItem.highestBid);
            let parsedBid = parseInt(answer.bid);
            let parsedQuantity = parseInt(chosenItem.quantity);
            // If an item is purchased, the QUANTITY is reduced by 1
            let decrementQty = parsedQuantity - 1;
            let itemId = chosenItem.id;
                console.log(" ");
                console.log("------------------------ ITEM #" + itemId + " -----------------------------");
                console.log("  ");
                console.log("   >|< -------------- Starting bid is: " + chosenItem.startingBid);
                console.log("    ?  ------------ Quantity in stock: " + parsedQuantity);
                console.log("    ^  ------------ Previous high bid: " + parsedHighestBid);
                console.log("    >  --------------------- Your Bid: " + parsedBid);
                console.log("  ");
                console.log("------------------------ " + itemId + " -----------------------------------");
            // I needed to ensure 1. The bid was higher than the Highest Bid. 2. The bid was also higher than the Starting Bid, and 3. The quantity of the item was greater than 0
            if ((chosenItem.highestBid < parsedBid) && (parsedBid > chosenItem.startingBid) && (parsedQuantity > 0)) {
                connection.query(
                    "UPDATE homework11_db.auctionItems SET ? WHERE ?",[
                        {quantity: decrementQty},
                        {id: itemId}
                    ],
                    function(error) {
                        if (error) throw err;
                        console.log("!!! ------------------ Your bid successfully placed. -------- ('_') -- !!!");
                        console.log("!!! ------------------ " + chosenItem.itemName + " New Quantity: " + decrementQty);
                        console.log(" ");
                        start();
                    },
                     "UPDATE homework11_db.auctionItems SET ? WHERE ?",[
                        {highestBid: parsedBid},
                        {id: itemId}
                    ],
                    function(error) {
                        if (error) throw err;
                        console.log("!!! ------ Your bid successfully placed. -------- ('_') -- !!!");
                        console.log(" ");
                        start();
                    }
                );
            // If we're sold out, this happens
            } else if (chosenItem.quantity <= 0){
                console.log(" ");
                console.log("OUR APOLOGIES ---> " + chosenItem.itemName + " is currently out of stock.");
            // If the bid is too low, this happens
            } else {
                console.log("Your bid was too low. Give it one more try.");
                console.log(" ");
                start();
                }
            });
    });
}

// This is the RESTOCK function from a selection within start()
// First we query the homework11_db.auctionItems table, then we allow the user to input the restock amount via an Inquirer prompt
function restockAuction() {
    connection.query("SELECT * FROM auctionItems", function(err,results) {
        if (err) throw err;
        console.log(results);
        inquirer.prompt([{
            name: "choice",
            type: "rawlist",
            choices: function(){
                var choiceArray = [];
                for (var i = 0; i < results.length; i++ ){
                    choiceArray.push(results[i].itemName);
                } 
                return choiceArray;
            },
            message: "Which item would you like to RESTOCK?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many units would you like to stock?"
            }
            ]).then(function(answer){
                var chosenItem;
                for (var i = 0; i < results.length; i++){
                    if (results[i].itemName === answer.choice){
                    chosenItem = results[i];
                }
            }
            let parsedQuantity = parseInt(chosenItem.quantity);
            let itemId = chosenItem.id;
                console.log(" ");
                console.log("------------------------ ITEM #" + itemId + " -----------------------------");
                console.log("  ");
                console.log("------------ Quantity in stock: " + answer.quantity);
                console.log("  ");
                console.log("------------------------ " + itemId + " -----------------------------------");
           
                connection.query(
                    "UPDATE homework11_db.auctionItems SET ? WHERE ?",[
                        {quantity: answer.quantity},
                        {id: itemId}
                    ],
                    function(error) {
                        if (error) throw err;
                        console.log(" ");
                        console.log("!!! ------ " + chosenItem.itemName.toUpperCase() + " HAS BEEN RESTOCKED -------- ('_') -- !!!");
                        console.log(" ");
                        start();
                    }
                )
            });
    });
       
}