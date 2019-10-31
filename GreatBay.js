var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Bbatman778",
    database: "homework11_db"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("Connected as id: " +connection.threadId);
    start();
});

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
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;    
                }
            }
        ])
        .then(function(answer) {
            connection.query("INSERT INTO auctionItems SET ?", 
            {
                itemName: answer.item,
                category: answer.category,
                startingBid: answer.startingBid || 0,
                highestBid: answer.highestBid || 0,
                quantity: answer.quantity || 0
            },
            function(err) {
                if (err) throw err;
                console.log("Your new item has been posted for sale.");
                start();
            }
        );
    });
}

function bidAuction(){
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
            
            let parsedHighestBid = parseInt(chosenItem.highestBid);
            let parsedBid = parseInt(answer.bid);
            let parsedQuantity = parseInt(chosenItem.quantity);
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
            } else if (chosenItem.quantity <= 0){
                console.log(" ");
                console.log("OUR APOLOGIES ---> " + chosenItem.itemName + " is currently out of stock.");
            } else {
                console.log("Your bid was too low. Give it one more try.");
                console.log(" ");
                start();
                }
            });
    });
}

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