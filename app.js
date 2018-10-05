var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer");
    
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true });

//APP CONFIGURATION
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//MONGOOSE/MODEL CONFIGURATION
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created:
        {
            type: Date, default: Date.now()
        }
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//   title: "Blog Test",
//   image: "https://images.unsplash.com/photo-1536062554668-d22774e87755?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=b4c51d06978a45e7892599b66868bfce&auto=format&fit=crop&w=668&q=80",
//   body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget est a dui semper tincidunt. Suspendisse sagittis at tellus vel sodales."
// });

//RESTFUL ROUTES

//INDEX ROUTE
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function(req,res){
    Blog.find({}, function(err, blogs){
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req,res){
    req.body.blog.body = req.expressSanitizer(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if (err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   })
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.expressSanitizer(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if (err) {
            res.redirect("/blogs");
        } else {
            var showUrl = "/blogs/" + req.params.id;
            res.redirect(showUrl);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.redirect("/blogs");
        } else {res.redirect("/blogs")
        }
    })
})

app.listen(process.env.PORT, process.env.ID, function(){
    console.log("Server is running..");
});