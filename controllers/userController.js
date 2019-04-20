const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cat = require('../models/Cat');

// This function gets a list of all the Users
router.get('/', (req, res)=>{
    //  find users in the database
    User.find({}, (err, usersFromTheDatabase)=>{
        //  Show the users on the screen
        res.render('users/index.ejs', {
            //  move the users from the DB to the template
            usersOnTheTemplate: usersFromTheDatabase
        })
    })
})

// Show the form to create a new user
router.get('/new', (req, res)=>{
    // render the new.ejs screen
    res.render('users/new.ejs');
})

// Get a user by ID
router.get('/:id', (req, res)=>{
    //  Find the User by ID
    User.findById(req.params.id) 
    //  Load cats 
    .populate('cats')
    //  search for a match in the user DB
    .exec((err, userFromTheDatabase)=>{
        // check for an error
        if(err){
            // send the error
            res.send(err);
        // if there's no error
        } else {
            // render the users screen
            res.render('users/show.ejs', {
                // move the users from the DB to the ejs
                userOnTheTemplate: userFromTheDatabase});
        }

    })
})

//  Get an existing user by ID
router.get('/:id/edit', (req, res)=>{
    //  Passes the User ID to the findById function
    User.findById(req.params.id, (err, userFromTheDatabase)=>{
        // Render the edit.ejs
        res.render('users/edit.ejs', {
            // move a user from the DB to the Template
            userOnTheTemplate: userFromTheDatabase
        })
    })
})

//  post the created user
router.post('/', (req, res)=>{
    // pass the body of the new form to the create function
    User.create(req.body, (err, newlyCreatedUser)=>{
        // log the newly created user
        console.log(newlyCreatedUser)
        // redirect back to the users page
        res.redirect('/users')
    })
})

//  get a user to be updated
router.put('/:id', (req, res)=>{
    //  pass the user ID to the function for update 
    User.findByIdAndUpdate(req.params.id, req.body, (err, userFromTheDatabase)=>{
        // show the user to update
        console.log(userFromTheDatabase);
        // redirect back to the Users page
        res.redirect('/users');
    })
})

// This function deletes a user.
router.delete('/:id', (req, res)=>{
    // Delete the user from the DB
    User.findByIdAndDelete(req.params.id, (err, userFromTheDatabase)=>{
        // Show the deleted user
        console.log(userFromTheDatabase);
        // Delete ALL the cats associated with the deleted user
        Cat.deleteMany({
            _id: {
                // Mongo delete cats where the ID matches the User
                $in: userFromTheDatabase.cats
            }
            // Check for errors
        }, (err, data)=>{
            // Show the error
            console.log(data);
            // redirect back to the Users screen
            res.redirect('/users');
        })
    })
})

module.exports = router;