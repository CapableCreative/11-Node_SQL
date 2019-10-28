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
    console.log("Connected as id:" +connection.threadId);
    start();
});

function start() {
    inquirer
        .prompt({
            name:"postOrBid",
            type:"list",
            message:"Would you like to [POST] a new item, or [BID] on an existing item?",
            choices:["POST","BID", "QUIT"]
        }).then(function(answer) {
        if(answer.postOrBid.toUpperCase()=== "POST") {
            postAuction();
        } else if (answer.postOrBid.toUpperCase()=== "BID") {
            bidAuction();
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
                highestBid: answer.highestBid || 0
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
        //console.log(results);
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
            if (chosenItem.higestBid < parseInt(answer.bid)) {
                connection.query(
                    "UPDATE auctionItems SET ? WHERE ?",[
                        {highestBid: answer.bid,},
                        {id: chosenItem.id}
                    ],
                    function(error) {
                        if (error) throw err;
                        console.log("Bid successfully placed.");
                        start();
                    }
                );
            } else {
                console.log("Your bid was too low. Give it one more try.");
                start();
                }
            });
    });
}