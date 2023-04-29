const express = require("express");
const app = express();

// 3000 is what we used for local. For Heroku we need to use process.env.PORT. Which is a dynamic port.
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};

const bodyParser = require("body-parser");

// Import and configure dotenv.
require('dotenv').config()

// Insert your own AtlasDB URL and User info in .env file.
const atlasDBInfo = process.env.ATLAS_URL_INFO;

// Our local module and function we created in date.js. Module gets bound to date here.
const date = require(__dirname + "/date.js"); 

const mongoose = require("mongoose");

const _ = require("lodash");

// //Connect to DB locally
// mongoose.connect("mongodb://localhost:27017/todolistDB")

// Connect to Atlas DB and creates todolistDB
mongoose.connect(atlasDBInfo + "todolistDB");

//Create new Schema
const itemSchema = {
    name: String,
};

// Create new Model
const Item = mongoose.model(
    "Item",
    itemSchema
);

// Create new Document 
const item1 = new Item ({
    name: "Welcome to your todolist!"
});

const item2 = new Item ({
    name: "<--- Hit this to delete an item."
});

const item3 = new Item ({
    name: "Hit the + button to add a new item."
});

// Array of todolist items 
const defaultItems = [item1, item2, item3];

// List schema for new list created 
const listSchema = {
    name: String,
    items: [itemSchema]
};

// Create mongoose model for list.
const List = mongoose.model("List", listSchema);

// This sets ejs as the view engine.
app.set("view engine", "ejs");

// This sets up body-parser for use.
app.use(bodyParser.urlencoded({ extended: true }));

// This serves static files in public folder.
app.use(express.static("public"));

app.get("/", function (req, res) {




    // Find items and log items in items collection
    Item.find({})
    .then(function (foundItems) {

        if (foundItems.length === 0) {

            // Insert many todolist items into items collection
            Item.insertMany(defaultItems)
                .then(function () {
                    console.log("Successfully saved all items to todolistDB");
                })
                .catch(function () {
                    console.log(err);
                });

                // This will redirect back into the home/root route and re-run the if/else statement. 
                // This will now run the else statement cause there should be items from the if statement added if it was originally empty.
        } else {

            // This creates response by rendering file called "list.ejs" in "views" folder. 
            // Into the list file we pass a single variable named "listTitle" and the value.
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }

    })
    .catch(function (err) {
        console.log(err);
    });


});

// Uses ejs template to create a new todolist page with a dynamic route.
app.get("/:customListName", function (req, res) {

    // Uses lodash to force the input into capitalized format.
    const customListName = _.capitalize(req.params.customListName);
    
    
    // Check if custom list name alreasy exists or not.
    List.findOne({name: customListName})
    .then(function (foundList) {
        if (!foundList) {
                // Create new list for custom list, starting with the default items automatically.
                const list = new List({
                   name: customListName,
                   items: defaultItems
                });
               
                //Save new list into collection.
                list.save(); 

                // Redirect back to custom list that was created.
                res.redirect("/" + customListName)
            } else {
                // Show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        })
        .catch(function (err) {
            console.log(err);
        });


 });



// Uses body-parser to grab the body input item named newItem in list.ejs
app.post("/", function (req, res) {

    // This gets the input item name from list.ejs.
    const itemName = req.body.newItem;

    // This gets the input list name from list.ejs.
    const listName = req.body.list;

    // This takes the input item name and create a new document item.
    const item = new Item ({
        name: itemName
    });

    if (listName === "Today") {

        // This will save the item into the collection of items 
        item.save();
    
        // This redirects back to the homepage to show the new item which was added 
        res.redirect("/");

    } else {

        // Find list in database then push item into array of items. Else log error.
        List.findOne({name: listName})
            .then(function (foundList) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
            .catch(function (err) {
                console.log(err);
            });
    };

});

// Uses body-parser to grab the body input checkbox id in list.ejs and remove from todolist.
app.post("/delete", function (req, res) {

    // Checks checkbox in list.ejs
    const checkedItemId = req.body.checkbox;

    // Checks listName in list.ejs
    const listName = req.body.listName;

    if (listName === "Today") {

        // This takes the checkedItemId and deletes in the db then redirects back to home "/" to show that its removed.
        Item.findByIdAndDelete ({_id: checkedItemId})
            .then (function (result) {
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            })
            .catch (function (err){
                console.log(err);
            });

    } else {

        // This finds the checked item on the custom list and removes from db.
        // Uses $pull from MongoDB
        List.findOneAndUpdate ({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then (function (foundList) {
            console.log("Successfully deleted checked item.");
            res.redirect("/" + listName);
        })
        .catch (function (err){
            console.log(err);
        });
    }


});

// Uses ejs template but not the layout with the header or footer.
app.get("/about", function (req,res) {
    res.render("about");
});

app.listen(port, function () {
    console.log("Server started successfully.");
});