const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("./chinook.db");
const app = express();
app.use(express.json());
// Test route: list all tables in the database
app.get('/tables', (req, res) => {
    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    res.json(stmt.all());
});
app.get('/artists', (req, res) => {
    const stmt = db.prepare("SELECT * FROM Artist ORDER BY name");
    res.json(stmt.all());
});
app.get('/artists/:id/albums', (req, res) => {
    const stmt = db.prepare("SELECT * FROM Album WHERE ArtistID = ?");
    res.json(stmt.get(req.query));
});
app.get('/tracks/long', (req, res) => {
    const stmt = db.prepare("SELECT * FROM Track JOIN Album ON Track.AlbumID = Album.AlbumID WHERE Milliseconds > 300000");
    res.json(stmt.all());
});
app.get('/genres/:id/stats', (req, res) => {
    const stmt = db.prepare("SELECT COUNT(*), AVG(Milliseconds / 1000) FROM Genre JOIN Track ON Genre.GenreID = Track.GenreID");
    res.json(stmt.get(req.query));
});
app.post('/playlists', (req, res) => {
    const stmt = db.prepare("INSERT INTO Playlist (Name) Values (?)");
    const result = stmt.run(req.body.name);
    res.status(201).json(result.lastInsertRowid);
});
app.delete('/playlists/:id', (req, res) => {
    const stmt = db.prepare("DELETE FROM Playlist WHERE PlaylistID = ?");
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
        res.status(404).json({ error: "Playlist not found" });
    }else{
        res.json({ message: "Playlist deleted" });
    }
});
app.get('/search', (req, res) => {
    const stmt = db.prepare("SELECT * FROM Track JOIN Genre ON Track.GenreID = Genre.GenreID JOIN Album ON Track.AlbumID = Album.AlbumID JOIN Artist ON Album.ArtistID = Artist.ArtistID LIKE '?'");
    res.json(stmt.get(req.query.q));
});
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});