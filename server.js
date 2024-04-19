/********************************************************************************
* WEB322 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: __Yingtong Lyu__ Student ID: __143631224__ Date: __4/19/2024__

  Link to assignment: https://spotless-tick-outerwear.cyclic.app/
*
********************************************************************************/

const express = require('express');
const path = require('path');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const legoData = require("./modules/legoSets");
const Theme = require("./modules/legoSets").Theme;

// Use EJS as the template engine
app.set("view engine", "ejs");

// Serve static files from 'public' directory
app.use(express.static('public'));

//application will be using urlencoded form data
app.use(express.urlencoded({ extended: true })); 

require("dotenv").config(); 

// Homepage route
app.get('/', (req, res) => { 
    // Example of rendering 'home.ejs' without additional data
    res.render('home', { page: '/' });
});

// About route
app.get('/about', (req, res) => {
  // Pass 'page' data for navbar highlighting
  res.render('about', { page: '/about' });
}); 

// Sets route - Adjusted to render a view instead of sending JSON
app.get('/lego/sets', (req, res) => { 
  const theme = req.query.theme;
  if (theme) {
    legoData.getSetsByTheme(theme)
      .then(legoSets => {
        res.render("sets", { sets: legoSets, page: '/lego/sets' });
      })
      .catch(error => {
        console.error(error);
        res.status(404).render("404", { page: '' });
      });
  } else {
    legoData.getAllSets()
      .then(legoSets => {
        res.render("sets", { sets: legoSets, page: '/lego/sets' });
      })
      .catch(error => {
        console.error(error);
        res.status(500).render("error", { error: error, page: '' });
      });
  }
});

// Individual Set route - Adjusted to render a view instead of sending JSON
app.get('/lego/sets/:set_num', (req, res) => {
  const setNum = req.params.set_num;
  legoData.getSetByNum(setNum)
  .then(legoSet => {
    if (legoSet) {
      // Make sure 'setDetail.ejs' exists in your 'views' directory
      res.render("setDetail", { set: legoSet, page: '/lego/sets' });
    } else {
      // Render a 404 page if set not found
      res.status(404).render("404", { page: '' });
    }
  })
  .catch(error => {
    console.error(error);
    res.status(500).render("error", { error: error, page: '' });
  });
});

//  routes  for "/lego/addSet"
app.get("/lego/addSet", async (req, res) => {
  try {
    const themes = await legoData.fetchAllThemes(); 
    res.render("addSet", { themes });
  } catch (err) {
    console.error(err); 
    res.render("500", { message: `Error: ${err.message}` });
  }
});

// route for adding a new set
app.post("/lego/addSet", async (req, res) => {
  try {
    const { name, year, num_parts, img_url, set_num } = req.body;

    // Include set details without theme ID
    const setDetails = { name, year, num_parts, img_url, set_num };

    // Add the set to the database
    await legoData.addSet(setDetails);

    res.redirect("/lego/sets");
  } catch (err) {
    console.error(err);
    res.render("500", { message: `Error: ${err.message}` });
  }
});


//  routes  for "/lego/editSet"
// Route to load the edit form
app.get("/lego/editSet/:set_num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.set_num);
    if (!set) {
      res.status(404).render("404", { message: "Set not found" });
      return;
    }
    const themes = await legoData.fetchAllThemes();
    res.render("editSet", { set, themes });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).render("500", { message: err.message });
  }
});




app.post("/lego/editSet", async (req, res) => {
  try {
    console.log('Received edit request for set:', req.body.set_num);
    console.log('Request body:', req.body);

    const result = await legoData.editSet(req.body.set_num, req.body);
    console.log('Update result:', result);

    res.redirect("/lego/sets");
  } catch (err) {
    console.error('Error in editSet:', err);
    res.status(500).render("500", { message: `Error updating set: ${err.message}` });
  }
});


// route for delete
app.get("/lego/deleteSet/:set_num", async(req,res) => {
  try {
      await legoData.deleteSet(req.params.set_num);
      res.redirect("/lego/sets");
  } catch (err) {        
      res.render("500", { message: `Error: ${err.message}` });
  }
});


// Generic 404 route handler - Adjusted to render a 404 EJS template
app.use((req, res) => {
  res.status(404).render("404", { page: '' });
});

app.listen(HTTP_PORT, () => console.log(`Server listening on: http://localhost:${HTTP_PORT}`));