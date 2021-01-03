const expr = require("express"),
      app  = expr(),
      serv = require("http").createServer(app),
      io   = require("socket.io")(serv),
      f    = require("fs"),
      sass = require("node-sass-middleware"),
      ftch = require("node-fetch"),
      slug = require("slugify");

Date.prototype.getWeek = function() {
  return Math.ceil((new Date(
    1970,
    this.getUTCMonth(),
    this.getUTCDate())
    .getTime() + 1) /
    (1000*60*60*24*7)); // converting milliseconds to weeks
}

const cal = new Date().getWeek();

app.use(sass({
  src: __dirname,
  dest: `${__dirname}/public`,
  outputStyle: 'extended',
}));

app.set("view engine", "pug");
app.use(expr.static(`${__dirname}/public`));

let read = () => JSON.parse(f.readFileSync("./data/data.json"));
let write = dat => f.writeFileSync("./data/data.json", JSON.stringify(dat));

/*
// JUST IN CASE
x = read();
x.length = 53;
x.fill({});
write(x);
*/

app.get("/", (req, res) => {
  let usr = req.get('X-Replit-User-Name');
  res.render("index.pug", {
    name: usr ? usr : false }
  );
});

app.get("/submit", (req, res) => {
  let usr = req.get('X-Replit-User-Name');
  let data = read()[cal - 1];
  //data = {usr: {}};
  if (typeof data[usr] !== "object") data[usr] = {};
  console.log(data);
  if (usr) res.render("submit.pug", { name: usr, num: cal, dat: data[usr] });
  else res.status(403).render("404.pug", { err: 403 });
});

app.get("/chal", (req, res) => {
  let usr = req.get('X-Replit-User-Name');
  if (usr)
    res.render(`chal/${cal}.pug`, { name: usr, num: cal});
  else res.status(403).render("404.pug", { err: 403 });
});


app.get("/leader", (_, res) => {
  res.send("<h1>sorry leaderboard doesn't work yet</h1>")
});

app.get("*", (_, res) => res.status(404).render("404.pug", { err: 404 }))

io.on("connection", sock => {
  console.log("New Submission Session Started.");
  sock.on("submit", async (chal, usr, name) => {
    let gty;
    await ftch(`https://repl.it/@${usr}/${slug(name, { strict: true })}`, {
      headers: {
        "User-Agent": "Mozilla/5.0"
    }})
      .then(res => gty = Number(res.status));
    sock.emit("do", gty == 200);
    if (gty != 200) return;
    let data = read();
    data.length = chal;
    data[chal - 1][usr] = { repl: name };
    data[chal - 1][usr].repl = name;
    write(data);
  });
});

serv.listen(6111);

