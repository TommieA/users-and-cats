const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const User = require('../models/User');

// This gets all the cats from the Database and puts them into
// the Template.
router.get('/', (req, res)=>{
    //  find cats on the DB
    Cat.find({}, (err, catsFromTheDatabase)=>{
        // show the found cats on the screen
        res.render('cats/index.ejs', {
            // move cats from the DB to the screen
            catsOnTheTemplate: catsFromTheDatabase
        })
    })
})

// This function creates a new cat by calling new.ejs
router.get('/new', (req, res)=>{
    //  find a user
    User.find({}, (error, allUsers) => {
        // if there's an eror
        if(error) {
            // sned the error to the function
            res.send(error)
            // if there is no error
        } else {
            //  show the new cats
            res.render('cats/new.ejs', {
                //  move all the users from the DB to the screen
                usersOnTemplate: allUsers
            })
        }
    })

})

// This gets a cat by ID and shows it by calling show.ejs.
router.get('/:id', (req, res) => {
    //  find a cat by ID
    Cat.findById(req.params.id, (err, catFromTheDatabase) => {
      //  find one user for a cat  
      User.findOne({
        "cats": req.params.id
        //  check for errors
      }, (err, user) => {
          // shgow the cat
        res.render('cats/show.ejs', {
            // move the cat from the DB to the screen
          catOnTheTemplate: catFromTheDatabase,
          //  move users to the screen
          user: user
        });
      })
    })
   })


// this Edits an already existing cat by calling edit.ejs
router.get('/:id/edit', (req, res)=>{
    //  find a cat by ID from the DB
    Cat.findById(req.params.id, (err, catFromTheDatabase)=>{
        // find the user from the DB
        User.find({}, (err, usersFromTheDatabase)=>{
            //  show cats and users on the screen
            res.render('cats/edit.ejs', {
                catOnTheTemplate: catFromTheDatabase,
                usersOnTemplate: usersFromTheDatabase
            });
        })

    })
})

//  This gives a cat to a user 
router.post('/', (req, res)=>{
    // show the requestor body
    console.log(req.body);
// Pass the body of the new Cat form to the Create function
    Cat.create(req.body, (err, newlyCreatedCat)=>{
        // Log the newly created Cat
        console.log(`Created a cat for user ${req.body.userId}`);
        // Verify that the User exists
        User.findById(req.body.userId, function(err, userFound)
        {
            userFound.cats.push(newlyCreatedCat._id);
            userFound.save((err, savedUser)=>{
                console.log(savedUser);
                res.redirect('/cats')
            });
        });

    })
})

// This gets a cat by ID and gives it to a user user then removes it
// from the original user.
router.put('/:id', (req, res)=>{
    // log the request body
    console.log(req.body);
    // pass the cat ID to the function
    Cat.findByIdAndUpdate(req.params.id, req.body, {new: true},(err, updatedCat)=>{
      // 
      User.findOne({'cats': req.params.id}, (err, foundUser) => {
        // check to make sure the cat is going to a new user
        if(foundUser._id.toString() !== req.body.userId){
          // remove the cat from the original user
          foundUser.cats.remove(req.params.id);
          // 
          foundUser.save((err, savedFoundUser) => {
            User.findById(req.body.userId, (err, newUser) => {
              newUser.cats.push(updatedCat._id);
              newUser.save((err, savedNewUser) => {
                res.redirect('/cats/' + req.params.id);
              })
            })
          })
        // If the cat is not going to a new user, redirect back to
        // the Cats screen 
        } else {
          res.redirect('/cats/' + req.params.id)
        }
      })
    });
  });

// Thisa route gets an existing cat by ID them deletes it and removes the cat
// from its user.
router.delete('/:id', (req, res)=>{
    // Find the cat by ID and Delete
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        // Log the cat that was removed from the DB
        console.log(catFromTheDatabase);
        // Redirect back to the Cat screen
        res.redirect('/cats');
    })
})
router.delete('/:id', (req, res)=>{
    // Find the Cat by ID and Delete
    Cat.findByIdAndDelete(req.params.id, (err, catFromTheDatabase)=>{
        // Log the cat that was Deleted from the DB
        console.log(catFromTheDatabase);
        // Find One User that had this cat
        User.findOne({'cats': req.params.id}, (err, foundUser)=>{
            // If there was an error, Console.log the error
            if(err){
                console.log(err)
            // Otherwise, Log the User
            }else{
                console.log(foundUser);
                // Remove the cat from the user
                foundUser.cats.remove(req.params.id);
                // Save the Updated user
                foundUser.save((err, updatedUser)=>{
                    // Log the Updated User
                    console.log(updatedUser);
                    // Redirect back to the Cats screen.
                    res.redirect('/cats');  
                })
            };
        });
    });
});

module.exports = router;