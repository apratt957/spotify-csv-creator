const fileInput = document.querySelector("input");
const status = document.getElementById("status");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data.albums)) {
      throw new Error("Invalid file format: missing albums array");
    }

    const albumsByArtist = {};

    for (const { artist, album } of data.albums) {
      if (!albumsByArtist[artist]) {
        albumsByArtist[artist] = [];
      }
      albumsByArtist[artist].push(album);
    }

    const rows = ["Artist,Albums"];

    const sortedArtists = Object.keys(albumsByArtist).sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" })
    );

    for (const artist of sortedArtists) {
      const albums = albumsByArtist[artist];
      const albumString = albums.map((a) => `- ${a}`).join("\n");

      const safeArtist = `"${artist.replace(/"/g, '""')}"`;
      const safeAlbums = `"${albumString.replace(/"/g, '""')}"`;

      rows.push(`${safeArtist},${safeAlbums}`);
    }

    const csvBlob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "albums.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    status.textContent = "CSV downloaded successfully.";
    status.className = "status success";
  } catch (err) {
    status.textContent = err.message;
    status.className = "status error";
  }
});
